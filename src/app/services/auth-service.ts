import { inject, Injectable } from '@angular/core';
import { AuthClient } from './auth-client';
import { Observable, tap } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  httpClient = inject(AuthClient);
  private readonly TOKEN_KEY = 'authToken';

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
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
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
