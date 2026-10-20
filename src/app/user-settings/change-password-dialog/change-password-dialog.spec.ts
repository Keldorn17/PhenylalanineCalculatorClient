import {describe, it, expect, vi, beforeEach} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {ChangePasswordDialog} from './change-password-dialog';
import {AuthService} from '../../auth/auth-service';
import {MatDialogRef} from '@angular/material/dialog';
import {provideTranslateService} from '@ngx-translate/core';
import {of, throwError} from 'rxjs';

describe('ChangePasswordDialog', () => {
  let component: ChangePasswordDialog;
  let authServiceMock: {changePassword: ReturnType<typeof vi.fn>};
  let dialogRefMock: {close: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    authServiceMock = {
      changePassword: vi.fn(),
    };
    dialogRefMock = {
      close: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [ChangePasswordDialog],
      providers: [
        provideTranslateService(),
        {provide: AuthService, useValue: authServiceMock},
        {provide: MatDialogRef, useValue: dialogRefMock},
      ],
    });

    const fixture = TestBed.createComponent(ChangePasswordDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize with invalid empty form', () => {
    expect(component['form'].valid).toBe(false);
  });

  it('should validate password matching and complexity', () => {
    component['form'].patchValue({
      oldPassword: 'OldPassword123!',
      password: 'weak',
      confirmPassword: 'weak',
    });
    expect(component['form'].get('password')?.hasError('pattern')).toBe(true);

    component['form'].patchValue({
      password: 'StrongPassword123!',
      confirmPassword: 'MismatchPassword123!',
    });
    expect(component['form'].get('confirmPassword')?.hasError('passwordMismatch')).toBe(true);

    component['form'].patchValue({
      confirmPassword: 'StrongPassword123!',
    });
    expect(component['form'].valid).toBe(true);
  });

  it('should close dialog with false on cancel', () => {
    component['cancel']();
    expect(dialogRefMock.close).toHaveBeenCalledWith(false);
  });

  it('should not submit if form is invalid', () => {
    component['submit']();
    expect(authServiceMock.changePassword).not.toHaveBeenCalled();
  });

  it('should call authService.changePassword and close with true on success', () => {
    authServiceMock.changePassword.mockReturnValue(of({
      accessToken: 'newToken',
      expiresIn: 3600,
    }));

    component['form'].patchValue({
      oldPassword: 'OldPassword123!',
      password: 'NewStrongPassword123!',
      confirmPassword: 'NewStrongPassword123!',
    });

    component['submit']();

    expect(authServiceMock.changePassword).toHaveBeenCalledWith({
      oldPassword: 'OldPassword123!',
      password: 'NewStrongPassword123!',
    });
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
    expect(component['isLoading']()).toBe(false);
  });

  it('should set error message on service failure', () => {
    authServiceMock.changePassword.mockReturnValue(throwError(() => new Error('Error')));

    component['form'].patchValue({
      oldPassword: 'OldPassword123!',
      password: 'NewStrongPassword123!',
      confirmPassword: 'NewStrongPassword123!',
    });

    component['submit']();

    expect(dialogRefMock.close).not.toHaveBeenCalled();
    expect(component['errorMessage']()).toBe('settings.changePasswordDialog.errorFailed');
    expect(component['isLoading']()).toBe(false);
  });

  it('should clear error message when form value changes', () => {
    component['errorMessage'].set('settings.changePasswordDialog.errorFailed');
    component['form'].patchValue({oldPassword: 'differentOldPassword'});
    expect(component['errorMessage']()).toBeNull();
  });
});
