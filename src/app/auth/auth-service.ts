import {Injectable, NgZone, OnDestroy, Signal, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, catchError, finalize, firstValueFrom, from, shareReplay, tap, throwError} from 'rxjs';
import {ApiPath} from '../http/api-path';
import {AuthBroadcastMessage, AuthRegisterRequest, AuthRequest, AuthResponse} from './auth-types';
import {UserService} from '../user/user-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private readonly userService = inject(UserService);
  private readonly http = inject(HttpClient);
  private readonly ngZone = inject(NgZone);

  public readonly accessToken: Signal<string | null>;

  private readonly accessTokenSignal = signal<string | null>(null);
  private readonly lockName = 'phe_auth_refresh_lock';
  private readonly channelName = 'phe_auth_channel';
  private readonly refreshBufferSeconds = 30;
  private refreshTimeout: ReturnType<typeof setTimeout> | null = null;
  private inFlightRefresh: Observable<AuthResponse> | null = null;
  private boundVisibilityHandler: (() => void) | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private boundFocusHandler: (() => void) | null = null;
  private tokenExpiresAt: number | null = null;
  private lastRefreshFailureTime = 0;

  constructor() {
    this.accessToken = this.accessTokenSignal.asReadonly();
    this.initBroadcastChannel();
    this.initVisibilityListener();
  }

  public getAccessToken(): string | null {
    return this.accessTokenSignal();
  }

  public login(authRequest: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(ApiPath.auth.authenticate, authRequest).pipe(
      tap(response => {
        const expiresAt = Date.now() + response.expiresIn * 1000;
        this.applyTokenResponse(response.accessToken, response.expiresIn, expiresAt, true, 'LOGIN_SUCCESS');
      })
    );
  }

  public register(authRegisterRequest: AuthRegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(ApiPath.auth.register, authRegisterRequest).pipe(
      tap(response => {
        const expiresAt = Date.now() + response.expiresIn * 1000;
        this.applyTokenResponse(response.accessToken, response.expiresIn, expiresAt, true, 'LOGIN_SUCCESS');
      })
    );
  }

  public refresh(): Observable<AuthResponse> {
    if (this.inFlightRefresh) {
      return this.inFlightRefresh;
    }

    this.inFlightRefresh = from(this.executeRefreshWithCoordination()).pipe(
      finalize(() => {
        this.inFlightRefresh = null;
      }),
      shareReplay(1)
    );

    return this.inFlightRefresh;
  }

  public logout(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(ApiPath.auth.logout, {}).pipe(
      tap(() => this.clearSession(true)),
      catchError(error => {
        this.clearSession(true);
        return throwError(() => error);
      })
    );
  }

  public isAuthenticated(): boolean {
    return !!this.accessTokenSignal();
  }

  public deleteAccount(): Observable<void> {
    return this.userService.deleteUser().pipe(
      tap(() => this.clearSession(true)),
      catchError(error => {
        this.clearSession(true);
        return throwError(() => error);
      })
    );
  }

  public ngOnDestroy(): void {
    this.clearRefreshTimeout();

    if (typeof document !== 'undefined' && this.boundVisibilityHandler) {
      document.removeEventListener('visibilitychange', this.boundVisibilityHandler);
      this.boundVisibilityHandler = null;
    }

    if (typeof window !== 'undefined' && this.boundFocusHandler) {
      window.removeEventListener('focus', this.boundFocusHandler);
      this.boundFocusHandler = null;
    }

    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
  }

  private async executeRefreshWithCoordination(): Promise<AuthResponse> {
    return this.acquireCrossTabLock(async () => {
      if (this.isTokenFresh()) {
        return this.createFreshResponse();
      }

      await new Promise(resolve => setTimeout(resolve, 20));

      if (this.isTokenFresh()) {
        return this.createFreshResponse();
      }

      if (Date.now() - this.lastRefreshFailureTime < 3000 && !this.accessTokenSignal()) {
        throw new Error('Session expired');
      }

      try {
        const response = await firstValueFrom(
          this.http.post<AuthResponse>(ApiPath.auth.refresh, {})
        );
        const expiresAt = Date.now() + response.expiresIn * 1000;
        this.applyTokenResponse(response.accessToken, response.expiresIn, expiresAt, true, 'REFRESH_SUCCESS');
        return response;
      } catch (error) {
        this.lastRefreshFailureTime = Date.now();
        this.clearSession(true, 'REFRESH_FAILURE');
        throw error;
      }
    });
  }

  private async acquireCrossTabLock<T>(action: () => Promise<T>): Promise<T> {
    if (typeof navigator !== 'undefined' && 'locks' in navigator && navigator.locks?.request) {
      return new Promise<T>((resolve, reject) => {
        navigator.locks.request(this.lockName, async () => {
          try {
            const result = await action();
            resolve(result);
          } catch (err) {
            reject(err);
          }
        }).catch(reject);
      });
    }

    return this.acquireLocalStorageLock(action);
  }

  private async acquireLocalStorageLock<T>(action: () => Promise<T>): Promise<T> {
    const lockTtlMs = 10000;
    const pollIntervalMs = 50;
    const maxWaitMs = 12000;
    const startTime = Date.now();

    const tryAcquire = (): boolean => {
      const now = Date.now();
      const existing = localStorage.getItem(this.lockName);
      if (existing) {
        const lockTime = Number(existing);
        if (now - lockTime < lockTtlMs) {
          return false;
        }
      }
      localStorage.setItem(this.lockName, String(now));
      return true;
    };

    while (!tryAcquire()) {
      if (Date.now() - startTime > maxWaitMs) {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }

    try {
      return await action();
    } finally {
      try {
        localStorage.removeItem(this.lockName);
      } catch {
        // Ignore storage removal errors
      }
    }
  }

  private isTokenFresh(): boolean {
    if (!this.accessTokenSignal() || !this.tokenExpiresAt) {
      return false;
    }
    return this.tokenExpiresAt - Date.now() > this.refreshBufferSeconds * 1000;
  }

  private createFreshResponse(): AuthResponse {
    const remainingSeconds = Math.max(1, Math.round(((this.tokenExpiresAt ?? 0) - Date.now()) / 1000));
    return {
      accessToken: this.accessTokenSignal()!,
      expiresIn: remainingSeconds
    };
  }

  private applyTokenResponse(
    accessToken: string,
    expiresIn: number,
    expiresAt: number,
    broadcast: boolean,
    messageType: 'REFRESH_SUCCESS' | 'LOGIN_SUCCESS' = 'REFRESH_SUCCESS'
  ): void {
    this.accessTokenSignal.set(accessToken);
    this.tokenExpiresAt = expiresAt;

    this.scheduleTokenRefresh(expiresIn);

    if (broadcast && this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: messageType,
          accessToken,
          expiresIn,
          expiresAt
        } satisfies AuthBroadcastMessage);
      } catch (err) {
        console.warn('[Auth] Failed to broadcast auth message:', err);
      }
    }
  }

  private clearSession(
    broadcast: boolean,
    messageType: 'LOGOUT' | 'REFRESH_FAILURE' = 'LOGOUT'
  ): void {
    this.accessTokenSignal.set(null);
    this.tokenExpiresAt = null;
    this.clearRefreshTimeout();

    if (broadcast && this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: messageType
        } satisfies AuthBroadcastMessage);
      } catch (err) {
        console.warn('[Auth] Failed to broadcast logout message:', err);
      }
    }
  }

  private scheduleTokenRefresh(expiresIn: number): void {
    this.clearRefreshTimeout();

    const refreshDelay = Math.max(0, (expiresIn - this.refreshBufferSeconds) * 1000);

    this.ngZone.runOutsideAngular(() => {
      this.refreshTimeout = setTimeout(() => {
        this.ngZone.run(() => {
          this.refresh().subscribe({
            error: (err: unknown) => {
              console.error('[Auth] Background proactive refresh failed:', err);
            }
          });
        });
      }, refreshDelay);
    });
  }

  private clearRefreshTimeout(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  private initVisibilityListener(): void {
    if (typeof document === 'undefined') {
      return;
    }

    this.boundVisibilityHandler = (): void => {
      if (document.visibilityState === 'visible') {
        this.checkAndRefreshOnWake();
      }
    };

    document.addEventListener('visibilitychange', this.boundVisibilityHandler);

    if (typeof window !== 'undefined') {
      this.boundFocusHandler = (): void => {
        this.checkAndRefreshOnWake();
      };
      window.addEventListener('focus', this.boundFocusHandler);
    }
  }

  private checkAndRefreshOnWake(): void {
    if (!this.accessTokenSignal() && !this.tokenExpiresAt) {
      return;
    }

    const now = Date.now();

    if (!this.tokenExpiresAt || now >= this.tokenExpiresAt - this.refreshBufferSeconds * 1000) {
      this.refresh().subscribe();
    } else {
      const remainingSeconds = Math.max(0, Math.round((this.tokenExpiresAt - now) / 1000));
      this.scheduleTokenRefresh(remainingSeconds);
    }
  }

  private initBroadcastChannel(): void {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
      return;
    }

    try {
      this.broadcastChannel = new BroadcastChannel(this.channelName);
      this.broadcastChannel.onmessage = (event: MessageEvent<AuthBroadcastMessage>): void => {
        this.handleBroadcastMessage(event.data);
      };
    } catch (err) {
      console.warn('[Auth] BroadcastChannel initialization failed:', err);
    }
  }

  private handleBroadcastMessage(message: AuthBroadcastMessage): void {
    if (!message?.type) {
      return;
    }

    switch (message.type) {
      case 'REFRESH_SUCCESS':
      case 'LOGIN_SUCCESS':
        this.applyTokenResponse(message.accessToken, message.expiresIn, message.expiresAt, false);
        break;
      case 'REFRESH_FAILURE':
        this.lastRefreshFailureTime = Date.now();
        this.clearSession(false);
        break;
      case 'LOGOUT':
        this.clearSession(false);
        break;
    }
  }
}
