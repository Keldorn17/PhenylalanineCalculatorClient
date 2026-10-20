import {describe, it, expect} from 'vitest';
import {FormControl, FormGroup} from '@angular/forms';
import {passwordValidator, passwordMatchValidator} from './password-validator';

describe('Password Validators', () => {
  describe('passwordValidator', () => {
    it('should validate strong passwords', () => {
      const validControl = new FormControl('Password123!');
      expect(passwordValidator(validControl)).toBeNull();
    });

    it('should reject short passwords', () => {
      const shortControl = new FormControl('Pass1!');
      expect(passwordValidator(shortControl)).toEqual({
        pattern: {
          actualValue: 'Pass1!',
          requiredPattern: '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$#\\-!%*?&])[A-Za-z\\d@$#\\-!%*?&]{8,}$/',
        },
      });
    });

    it('should reject passwords missing numbers or special characters', () => {
      const noSpecial = new FormControl('PasswordOnly');
      expect(passwordValidator(noSpecial)).not.toBeNull();
    });
  });

  describe('passwordMatchValidator', () => {
    it('should pass when password and confirmPassword match', () => {
      const form = new FormGroup({
        password: new FormControl('Secret123!'),
        confirmPassword: new FormControl('Secret123!'),
      });

      expect(passwordMatchValidator(form)).toBeNull();
      expect(form.get('confirmPassword')?.hasError('passwordMismatch')).toBe(false);
    });

    it('should set passwordMismatch error when passwords differ', () => {
      const form = new FormGroup({
        password: new FormControl('Secret123!'),
        confirmPassword: new FormControl('Different123!'),
      });

      expect(passwordMatchValidator(form)).toEqual({passwordMismatch: true});
      expect(form.get('confirmPassword')?.hasError('passwordMismatch')).toBe(true);
    });

    it('should return null when controls are missing', () => {
      const form = new FormGroup({});
      expect(passwordMatchValidator(form)).toBeNull();
    });
  });
});
