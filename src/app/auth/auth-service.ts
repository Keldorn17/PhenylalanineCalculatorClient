import {Injectable, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, tap, catchError, throwError} from 'rxjs';
import {ApiPath} from '../http/api-path';
import {AuthRequest, AuthResponse, AuthRegisterRequest} from './auth-types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public readonly accessToken;

  private readonly http = inject(HttpClient);
  private readonly accessTokenSignal = signal<string | null>(null);
  private refreshTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.accessToken = this.accessTokenSignal.asReadonly();
  }

  public getAccessToken(): string | null {
    return this.accessTokenSignal();
  }

  public login(authRequest: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(ApiPath.auth.authenticate, authRequest).pipe(
      tap(response => {
        this.accessTokenSignal.set(response.accessToken);
        this.scheduleTokenRefresh(response.expiresIn);
      })
    );
  }

  public register(authRegisterRequest: AuthRegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(ApiPath.auth.register, authRegisterRequest).pipe(
      tap(response => {
        this.accessTokenSignal.set(response.accessToken);
        this.scheduleTokenRefresh(response.expiresIn);
      })
    )
  }

  public refresh(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(ApiPath.auth.refresh, {}).pipe(
      tap(response => {
        this.accessTokenSignal.set(response.accessToken);
        this.scheduleTokenRefresh(response.expiresIn);
      }),
      catchError(error => {
        this.accessTokenSignal.set(null);
        this.clearRefreshTimeout();
        return throwError(() => error);
      })
    );
  }

  public logout(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(ApiPath.auth.logout, {}).pipe(
      tap(() => {
        this.accessTokenSignal.set(null);
        this.clearRefreshTimeout();
      }),
      catchError(error => {
        this.accessTokenSignal.set(null);
        this.clearRefreshTimeout();
        return throwError(() => error);
      })
    );
  }

  public isAuthenticated(): boolean {
    return !!this.accessTokenSignal();
  }

  private scheduleTokenRefresh(expiresIn: number): void {
    this.clearRefreshTimeout();

    const refreshDelay = Math.max(0, (expiresIn - 30) * 1000);

    console.log(`[Auth] Token expires in ${expiresIn}s. Scheduled refresh in ${Math.round(refreshDelay / 1000)}s.`);

    this.refreshTimeout = setTimeout((): void => {
      this.refresh().subscribe({
        next: (): void => {
          console.log('[Auth] Background proactive refresh completed.');
        },
        error: (err: unknown): void => {
          console.error('[Auth] Background proactive refresh failed:', err);
        }
      });
    }, refreshDelay);
  }

  private clearRefreshTimeout(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }
}
