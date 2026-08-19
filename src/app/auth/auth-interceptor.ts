import {HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from './auth-service';
import {BehaviorSubject, throwError, Observable} from 'rxjs';
import {catchError, filter, switchMap, take} from 'rxjs/operators';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  if (!req.url.includes('/api/')) {
    return next(req);
  }

  const addTokenAndCredentials = (request: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> => {
    let cloned = request.clone({withCredentials: true});

    const isAuthRequest =
      request.url.includes('/api/v1/auth/authenticate') ||
      request.url.includes('/api/v1/auth/refresh');

    if (token && !isAuthRequest) {
      cloned = cloned.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    return cloned;
  };

  const token = authService.getAccessToken();
  const authReq = addTokenAndCredentials(req, token);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        !req.url.includes('/api/v1/auth/authenticate') &&
        !req.url.includes('/api/v1/auth/refresh')
      ) {
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(req: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refresh().pipe(
      switchMap((response) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.accessToken);

        const clonedReq = req.clone({
          withCredentials: true,
          setHeaders: {
            Authorization: `Bearer ${response.accessToken}`
          }
        });
        return next(clonedReq);
      }),
      catchError((refreshError: HttpErrorResponse) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);
        authService.logout().subscribe({
          error: (err: HttpErrorResponse) => {
            console.warn('Auto-logout after refresh failure failed on server, session cleared locally:', err);
          }
        });
        return throwError(() => refreshError);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) => {
        const clonedReq = req.clone({
          withCredentials: true,
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(clonedReq);
      })
    );
  }
}
