import { inject, Injectable } from '@angular/core';
import { AuthClient } from './auth-client';
<<<<<<< HEAD
import { Observable, tap } from 'rxjs';
=======
import { catchError, map, Observable, of, tap } from 'rxjs';
>>>>>>> feature/componente-curso


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  httpClient = inject(AuthClient);
  private readonly TOKEN_KEY = 'authToken';

<<<<<<< HEAD
  login(login: string, password: string): Observable<string> {
    const loginRequest = { username: login, password };

    return this.httpClient.login(loginRequest).pipe(
      tap((token: string) => {
        localStorage.setItem(this.TOKEN_KEY, token);
      })
    );
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) {
      return null;
    }

    // Evita valores con caracteres de control (\n, \r, etc) que rompen setRequestHeader
    if (/[\u0000-\u001F\u007F]/.test(token)) {
      localStorage.removeItem(this.TOKEN_KEY);
      return null;
    }

    return token;
=======
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
>>>>>>> feature/componente-curso
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

<<<<<<< HEAD
=======
  isUser(): Observable<boolean> {
    if (!this.getToken()) {
      return of(false);
    }

    return this.httpClient.getCurrentUserFromToken().pipe(
      map(user => user.role === 'USER'),
      catchError(() => of(false))
    );
  }

>>>>>>> feature/componente-curso
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
