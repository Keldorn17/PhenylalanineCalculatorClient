import {HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent} from '@angular/common/http';
import {inject} from '@angular/core';
import {AuthService} from './auth-service';
import {Observable, throwError} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import {ApiPath} from '../http/api-path';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);

  if (!req.url.includes('/api/')) {
    return next(req);
  }

  const isAuthRequest =
    req.url.includes(ApiPath.auth.authenticate) ||
    req.url.includes(ApiPath.auth.refresh) ||
    req.url.includes(ApiPath.auth.register) ||
    req.url.includes(ApiPath.auth.logout);

  const token = authService.getAccessToken();

  let headers = req.headers;
  if (token && !isAuthRequest) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }

  const authReq = req.clone({
    headers,
    withCredentials: true
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthRequest) {
        return authService.refresh().pipe(
          switchMap(response => {
            const retriedReq = req.clone({
              withCredentials: true,
              setHeaders: {
                Authorization: `Bearer ${response.accessToken}`
              }
            });
            return next(retriedReq);
          }),
          catchError(refreshError => throwError(() => refreshError))
        );
      }
      return throwError(() => error);
    })
  );
};
