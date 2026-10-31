import {inject} from '@angular/core';
import {CanMatchFn} from '@angular/router';
import {catchError, map, of} from 'rxjs';
import {AuthService} from '../auth-service';

export const authMatchGuard: CanMatchFn = () => {
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    return true;
  }

  return authService.refresh().pipe(
    map(() => true),
    catchError(() => of(false)),
  );
};
