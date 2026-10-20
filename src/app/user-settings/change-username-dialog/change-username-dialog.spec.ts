import {describe, it, expect, vi, beforeEach} from 'vitest';
import {TestBed} from '@angular/core/testing';
import {ChangeUsernameDialog} from './change-username-dialog';
import {AuthService} from '../../auth/auth-service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {provideTranslateService} from '@ngx-translate/core';
import {of, throwError} from 'rxjs';

describe('ChangeUsernameDialog', () => {
  let component: ChangeUsernameDialog;
  let authServiceMock: {changeUsername: ReturnType<typeof vi.fn>};
  let dialogRefMock: {close: ReturnType<typeof vi.fn>};

  beforeEach(() => {
    authServiceMock = {
      changeUsername: vi.fn(),
    };
    dialogRefMock = {
      close: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [ChangeUsernameDialog],
      providers: [
        provideTranslateService(),
        {provide: AuthService, useValue: authServiceMock},
        {provide: MatDialogRef, useValue: dialogRefMock},
        {provide: MAT_DIALOG_DATA, useValue: {currentUsername: 'oldUser'}},
      ],
    });

    const fixture = TestBed.createComponent(ChangeUsernameDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize with invalid empty form', () => {
    expect(component['form'].valid).toBe(false);
  });

  it('should close dialog with false on cancel', () => {
    component['cancel']();
    expect(dialogRefMock.close).toHaveBeenCalledWith(false);
  });

  it('should not submit if form is invalid', () => {
    component['submit']();
    expect(authServiceMock.changeUsername).not.toHaveBeenCalled();
  });

  it('should call authService.changeUsername and close with true on success', () => {
    authServiceMock.changeUsername.mockReturnValue(of({
      accessToken: 'newToken',
      expiresIn: 3600,
    }));

    component['form'].patchValue({
      username: 'newUser',
      password: 'CurrentPassword123!',
    });

    component['submit']();

    expect(authServiceMock.changeUsername).toHaveBeenCalledWith({
      username: 'newUser',
      password: 'CurrentPassword123!',
    });
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
    expect(component['isLoading']()).toBe(false);
  });

  it('should set error message on service failure', () => {
    authServiceMock.changeUsername.mockReturnValue(throwError(() => new Error('Error')));

    component['form'].patchValue({
      username: 'newUser',
      password: 'CurrentPassword123!',
    });

    component['submit']();

    expect(dialogRefMock.close).not.toHaveBeenCalled();
    expect(component['errorMessage']()).toBe('settings.changeUsernameDialog.errorFailed');
    expect(component['isLoading']()).toBe(false);
  });

  it('should clear error message when form value changes', () => {
    component['errorMessage'].set('settings.changeUsernameDialog.errorFailed');
    component['form'].patchValue({username: 'anotherUser'});
    expect(component['errorMessage']()).toBeNull();
  });
});
