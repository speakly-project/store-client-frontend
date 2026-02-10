import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, retry, switchMap, tap, throwError, timer } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { CartItemInterface } from '../models/CartItemInterface';
import { CourseInterface } from '../models/CourseInterface';
import { AuthService } from './auth-service';
import { CoursesHttpClient } from './courses-http-client';
import { CartItem } from '../models/CartItem';
import { OrderInterface } from '../models/OrderInterface';


@Injectable({ providedIn: 'root' })
export class CartService {
  private static readonly GUEST_CART_KEY = 'guestCartCourseIds';
  private guestSyncInFlight = false;

  readonly isOpen = signal(false);
  readonly items = signal<CartItem[]>([]);

  readonly count = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  readonly subtotal = computed(() => this.items().reduce((sum, item) => sum + item.course.price * item.quantity, 0));
  readonly vat = computed(() => this.subtotal() * 0.21);
  readonly total = computed(() => this.subtotal() + this.vat());

  private readonly backendCart = signal<any | null>(null);

  readonly apiUrl = `${environment.apiUrl}api/speakly`;
  readonly urlCart = `${this.apiUrl}/cart`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
    private readonly coursesHttp: CoursesHttpClient,
    private readonly snackBar: MatSnackBar,
  ) {
    this.authService.currentUser$.subscribe((user) => {
      if (!user) {
        this.backendCart.set(null);
        this.loadGuestCartFromStorage();
        return;
      }

      this.syncGuestCartToBackend(user.id);
    });
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  clear(): void {
    this.items.set([]);

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.saveGuestCartToStorage([]);
      return;
    }

    this.persistToBackend();
  }

  addCourse(course: CourseInterface, quantity = 1): void {
    if (quantity <= 0) return;
    const courseId = course.id;

    // duplicaos
    const alreadyInCart = this.items().some(
      (i) => i.course.id === courseId,
    );
    if (alreadyInCart) {
      this.snackBar.open('Este curso ya está en tu carrito. No puedes añadirlo dos veces.', 'Cerrar', {
        duration: 2500,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }

    this.items.update((prev) => [...prev, { course, quantity }]);

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.saveGuestCartToStorage(Array.from(this.getUniqueCourseIds()));
      return;
    }

    this.persistToBackend();
  }

  removeCourse(courseId: string | number): void {
    this.items.update((prev) =>
      prev.filter((i) => i.course.id !== courseId),
    );

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.saveGuestCartToStorage(Array.from(this.getUniqueCourseIds()));
      return;
    }

    this.persistToBackend();
  }

  getCart(userId: number): Observable<OrderInterface> {
    return this.http.get<OrderInterface>(`${this.urlCart}/${userId}`);
  }

  updateCart(cartItem: CartItemInterface): Observable<void> {
    return this.http.put<void>(`${this.urlCart}`, cartItem).pipe(
      retry({
        count: 4,
        delay: (err, retryCount) =>
          this.shouldRetryLockError(err) ? timer(200 * retryCount) : throwError(() => err),
      }),
    );
  }

  private shouldRetryLockError(err: unknown): boolean {
    const anyErr = err as any;
    const code = anyErr?.error?.error;
    const message = anyErr?.error?.message ?? anyErr?.message;

    if (code === 'CannotAcquireLockException') return true;
    if (typeof message === 'string' && message.includes('CannotAcquireLockException')) return true;
    return false;
  }

  private refreshFromBackend(userId: number): void {
    this.getCart(userId)
      .pipe(
        switchMap((cart) => {
          this.backendCart.set(cart);
          const orderItems = Array.isArray(cart?.orderItems) ? cart.orderItems : [];
          if (orderItems.length === 0) {
            return of([] as CartItem[]);
          }

          const byCourseId = new Map<number, CartItem>();
          for (const it of orderItems) {
            const course = it?.course;
            const courseId = course?.id;
            const quantity = Number(it?.quantity ?? 1);
            if (!courseId) continue;
            if (!quantity || quantity <= 0) continue;
            if (byCourseId.has(courseId)) continue;

            byCourseId.set(courseId, { course, quantity });
          }

          return of([...byCourseId.values()]);
        }),
        tap((items) => this.items.set(items)),
        catchError((err) => {
          console.error('Error cargando el carrito', err);
          return of([] as CartItem[]);
        }),
      )
      .subscribe();
  }

  private syncGuestCartToBackend(userId: number): void {
    if (this.guestSyncInFlight) return;
    const guestIds = this.loadGuestCourseIdsFromStorage();
    if (guestIds.length === 0) {
      this.refreshFromBackend(userId);
      return;
    }

    this.guestSyncInFlight = true;

    this.getCart(userId)
      .pipe(
        switchMap((cart) => {
          this.backendCart.set(cart);

          const mergedIds = new Set<number>();
          const orderItems = Array.isArray(cart?.orderItems) ? cart.orderItems : [];
          for (const it of orderItems) {
            const courseId = it?.course?.id;
            if (!isFinite(courseId)) continue;
            mergedIds.add(courseId);
          }

          for (const id of guestIds) mergedIds.add(id);

          const payload: CartItemInterface = {
            id: cart?.id,
            userId,
            courseIds: Array.from(mergedIds.values()),
            status: cart?.orderStatus ?? 'PENDING',
          };

          if (!payload.id || payload.id <= 0) {
            return of(null);
          }

          return this.updateCart(payload).pipe(map(() => cart));
        }),
        tap(() => this.saveGuestCartToStorage([])),
        catchError((err) => {
          console.error('Error sincronizando carrito invitado', err);
          return of(null);
        }),
      )
      .subscribe({
        next: () => this.refreshFromBackend(userId),
        complete: () => {
          this.guestSyncInFlight = false;
        },
        error: () => {
          this.guestSyncInFlight = false;
        },
      });
  }

  private persistToBackend(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const existing = this.backendCart();
    const ensureBackendCart$ =
      existing && existing.id > 0
        ? of(existing)
        : this.getCart(user.id).pipe(
          tap((cart) => this.backendCart.set(cart)),
          catchError((err) => {
            console.error('No se pudo obtener el carrito antes de guardar', err);
            return of(null);
          }),
        );

    ensureBackendCart$
      .pipe(
        switchMap((cart) => {
          if (!cart || cart.id <= 0) {
            return of(null);
          }
          const payload = this.buildBackendCartPayload(user.id, cart);
          return this.updateCart(payload).pipe(map(() => cart));
        }),
        tap((cart) => {
          if (cart) this.backendCart.set(cart);
        }),
        catchError((err) => {
          console.error('Error guardando el carrito', err);
          this.snackBar.open('No se pudo actualizar el carrito. Inténtalo de nuevo.', 'Cerrar', {
            duration: 2500,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.refreshFromBackend(user.id);
          return of(null);
        }),
      )
      .subscribe();
  }

  private buildBackendCartPayload(userId: number, base: any): CartItemInterface {
    return {
      id: base?.id,
      userId,
      courseIds: Array.from(this.getUniqueCourseIds().values()),
      status: base?.orderStatus ?? base?.status ?? 'PENDING',
    };
  }

  private getUniqueCourseIds(): Set<number> {
    const uniqueCourseIds = new Set<number>();
    for (const item of this.items()) {
      const courseId = item.course?.id;
      if (!isFinite(courseId)) continue;
      uniqueCourseIds.add(courseId);
    }
    return uniqueCourseIds;
  }

  private loadGuestCourseIdsFromStorage(): number[] {
    try {
      const raw = localStorage.getItem(CartService.GUEST_CART_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const unique = new Set<number>();
      for (const v of parsed) {
        const id = Number(v);
        if (!isFinite(id)) continue;
        unique.add(id);
      }
      return Array.from(unique.values());
    } catch {
      return [];
    }
  }

  private saveGuestCartToStorage(courseIds: number[]): void {
    try {
      const unique = new Set<number>();
      for (const v of courseIds) {
        const id = Number(v);
        if (!isFinite(id)) continue;
        unique.add(id);
      }
      localStorage.setItem(CartService.GUEST_CART_KEY, JSON.stringify(Array.from(unique.values())));
    } catch {
      // ignore
    }
  }

  private loadGuestCartFromStorage(): void {
    const ids = this.loadGuestCourseIdsFromStorage();
    if (ids.length === 0) {
      this.items.set([]);
      return;
    }

    forkJoin(
      ids.map((id) =>
        this.coursesHttp.getCourseById(id).pipe(
          catchError(() => of(null as unknown as CourseInterface)),
        ),
      ),
    )
      .pipe(
        map((courses) =>
          courses
            .filter((c): c is CourseInterface => !!c && isFinite((c as any).id))
            .map((course) => ({ course, quantity: 1 } as CartItem)),
        ),
        tap((items) => this.items.set(items)),
        catchError((err) => {
          console.error('Error cargando carrito invitado', err);
          this.items.set([]);
          return of([] as CartItem[]);
        }),
      )
      .subscribe();
  }



}
