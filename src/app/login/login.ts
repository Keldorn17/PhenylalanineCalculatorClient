import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../auth/auth-service';
import {AuthRequest} from '../auth/auth-types';
import {LoginService} from './login-service';
import {ApiQueryParams} from '../http/api-types';

@Component({
  selector: 'login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login {
  public username = '';
  public password = '';
  public errorMessage = signal<string | null>(null);
  public isLoading = signal<boolean>(false);
  public successMessage = signal<string | null>(null);

  protected authService = inject(AuthService);
  private readonly loginService = inject(LoginService);

  public onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage.set('Please fill in both username and password.');
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isLoading.set(true);

    const authRequest: AuthRequest = {
      username: this.username,
      password: this.password
    }

    this.authService.login(authRequest).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Login successful!');

        this.fetchFoodType();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.details ||
          err.error?.title ||
          'Login failed. Please check your credentials.'
        );
        console.error('Login error:', err);
      }
    });
  }

  public fetchFoodType(): void {
    const params: ApiQueryParams = {
      page: 0,
      size: 20
    };

    console.log(`[Auth] Attempting to fetch food types list with params:`, params);
    this.loginService.getFoodTypes(params).subscribe({
      next: (data) => {
        console.log('--- Fetch Success (Paged Food Types) ---');
        console.log(data);
        this.successMessage.set(`Successfully fetched food types list: ${JSON.stringify(data.content)}`);
      },
      error: (err) => {
        console.warn('[Auth] Failed to fetch food types list, trying fallback to single ID 1:', err);

        this.loginService.getFoodTypeById(1).subscribe({
          next: (singleData) => {
            console.log('--- Fallback Fetch Success (/api/v1/food-type/1) ---');
            console.log(singleData);
            this.successMessage.set(`Successfully fetched single food type (fallback): ${JSON.stringify(singleData)}`);
          },
          error: (fallbackErr) => {
            console.error('[Auth] Fallback fetch also failed:', fallbackErr);
            this.errorMessage.set(`Auth succeeded, but fetching food type failed: ${fallbackErr.message}`);
          }
        });
      }
    });
  }

  public onRefresh(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isLoading.set(true);

    this.authService.refresh().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.successMessage.set('Token refreshed successfully!');
        console.log('Token refresh success:', res);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Refresh failed. Refresh token may be invalid or expired.');
        console.error('Refresh error:', err);
      }
    });
  }

  public onLogout(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isLoading.set(true);

    this.authService.logout().subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Logged out successfully.');
        console.log('Logout success.');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Logout request failed, but session cleared locally.');
        console.error('Logout error:', err);
      }
    });
  }
}
