import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of, catchError, map } from 'rxjs';
import { AuthService } from '../services/auth-service';
import { AuthClient } from '../services/auth-client';

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const authClient = inject(AuthClient);
  const router = inject(Router);

  const token = authService.getToken();
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  return authClient.getCurrentUserFromToken().pipe(
    map(() => true as boolean),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
