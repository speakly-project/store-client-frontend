import { inject, Injectable } from '@angular/core';
import { AuthClient } from './auth-client';
import { BehaviorSubject, catchError, map, Observable, of, switchMap, tap } from 'rxjs';
import { CoursesHttpClient } from './courses-http-client';
import { UserInterface } from '../models/UserInterface';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  httpClient = inject(AuthClient);
  coursesHttpClient = inject(CoursesHttpClient);
  private readonly TOKEN_KEY = 'authToken';

  private currentUserSubject = new BehaviorSubject<UserInterface | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  login(username: string, password: string): Observable<string> {
    return new Observable((observer) => {
      const loginRequest = { username, password };

      this.httpClient.getUserByUsername(username).subscribe({
        next: (user) => {
          if (user.role !== 'USER') {
            observer.error('Acceso denegado: no es un usuario registrado.');
            return;
          }

          this.httpClient.login(loginRequest).subscribe({
            next: (token: string) => {
              localStorage.setItem(this.TOKEN_KEY, token);

              // Precargamos el usuario completo (incluye profilePictureUrl) para el Header
              this.refreshCurrentUser().subscribe();

              observer.next(token);
              observer.complete();
            },
            error: (error) => {
              observer.error(error);
            }
          });
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  getCurrentUser(): UserInterface | null {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: UserInterface | null): void {
    this.currentUserSubject.next(user);
  }

  refreshCurrentUser(): Observable<UserInterface | null> {
    if (!this.getToken()) {
      this.currentUserSubject.next(null);
      return of(null);
    }

    return this.httpClient.getCurrentUserFromToken().pipe(
      switchMap((loginUser) => this.coursesHttpClient.getUserById(loginUser.id)),
      tap((user) => this.currentUserSubject.next(user)),
      catchError(() => {
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isUser(): Observable<boolean> {
    if (!this.getToken()) {
      return of(false);
    }

    return this.httpClient.getCurrentUserFromToken().pipe(
      map(user => user.role === 'USER'),
      catchError(() => of(false))
    );
  }

  logout(): void {
    this.httpClient.logout().subscribe({
      next: () => {
        localStorage.removeItem(this.TOKEN_KEY);
        this.currentUserSubject.next(null);
      },
      error: (error) => {
        console.error('Logout failed', error);
        localStorage.removeItem(this.TOKEN_KEY);
        this.currentUserSubject.next(null);
      },
    });
  }
}
