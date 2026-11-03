import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';

export const USERNAME_PATTERN = /^[\w-]{3,32}$/;

export function usernameValidator(control: AbstractControl): ValidationErrors | null {
  return Validators.pattern(USERNAME_PATTERN)(control);
}
