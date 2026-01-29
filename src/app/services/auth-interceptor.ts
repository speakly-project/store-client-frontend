import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from './auth-service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptor implements HttpInterceptor {
  router = inject(Router);
  authService = inject(AuthService);
  apiUrl = `${environment.apiUrl}api/speakly`;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    const isCloudinaryRequest = req.url.includes('api.cloudinary.com');
    const isBackendRequest = req.url.includes(this.apiUrl);
    const isPasswordChangeRequest = req.url.includes('/users/passwd');

    const authReq = token && !isCloudinaryRequest
      ? req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`),
        })
      : req;

    return next.handle(authReq).pipe(
      catchError((error) => {
        if (!isPasswordChangeRequest && isBackendRequest && (error.status === 401 || error.status === 403)) {
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
