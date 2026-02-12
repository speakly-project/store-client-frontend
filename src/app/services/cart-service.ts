import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { CartItemInterface } from '../models/CartItemInterface';
import { CourseInterface } from '../models/CourseInterface';
import { AuthService } from './auth-service';
import { CartItem } from '../models/CartItem';
import { OrderInterface } from '../models/OrderInterface';


@Injectable({ providedIn: 'root' })
export class CartService {
  readonly isOpen = signal(false);
  readonly items = signal<CartItem[]>([]);

  readonly count = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  readonly total = computed(() => this.items().reduce((sum, item) => sum + item.course.price * item.quantity, 0));
  readonly totalWithOutIva = computed(() => this.total() / 1.21);
  readonly vat = computed(() => this.total() - this.totalWithOutIva());

  private readonly backendCart = signal<any | null>(null);

  readonly apiUrl = `${environment.apiUrl}api/speakly`;
  readonly urlCart = `${this.apiUrl}/cart`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
    private readonly snackBar: MatSnackBar,
  ) {
    this.authService.currentUser$.subscribe((user) => {
      if (!user) {
        this.backendCart.set(null);
        this.items.set([]);
        return;
      }
      this.refreshFromBackend(user.id);
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

    this.persistToBackend();
  }

  removeCourse(courseId: string | number): void {
    this.items.update((prev) =>
      prev.filter((i) => i.course.id !== courseId),
    );
    this.persistToBackend();
  }

  getCart(userId: number): Observable<OrderInterface> {
    return this.http.get<OrderInterface>(`${this.urlCart}/${userId}`);
  }

  updateCart(cartItem: CartItemInterface): Observable<void> {
    return this.http.put<void>(`${this.urlCart}`, cartItem);
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
    const uniqueCourseIds = new Set<number>();
    for (const item of this.items()) {
      const courseId = item.course?.id;
      if (!isFinite(courseId)) continue;
      uniqueCourseIds.add(courseId);
    }

    return {
      id: base?.id,
      userId,
      courseIds: Array.from(uniqueCourseIds.values()),
      status: base?.orderStatus ?? base?.status ?? 'PENDING',
    };
  }

  loadCart(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;
    this.getCart(user.id);
  }

  payCart(cardNumber: string, expiryDate: string, cvv: string, fullName: string): Observable<void> {
    const user = this.authService.getCurrentUser();
    if (!user) return of(undefined);
    return this.http.post<void>(`${this.urlCart}/pay`, {
      userId: user.id,
      cardNumber,
      expiryDate,
      cvv,
      fullName,
    }).pipe(
      tap(() => {
        this.snackBar.open('Pago realizado con éxito. ¡Gracias por tu compra!', 'Cerrar', {
          duration: 2500,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.clear();
      }),
      catchError((err) => {
        console.error('Error al pagar el carrito', err);
        this.snackBar.open('Ha habido un error en tu pago. Inténtalo de nuevo.', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        throw err;
      }),
    );
  }
}
