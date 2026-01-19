import { inject, Injectable } from '@angular/core';
import { AuthClient } from './auth-client';
import { catchError, map, Observable, of, tap } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  httpClient = inject(AuthClient);
  private readonly TOKEN_KEY = 'authToken';

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
      },
      error: (error) => {
        console.error('Logout failed', error);
        localStorage.removeItem(this.TOKEN_KEY);
      },
    });
  }
}
