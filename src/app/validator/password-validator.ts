import {AbstractControl, ValidationErrors, Validators} from '@angular/forms';

export function passwordValidator(control: AbstractControl): ValidationErrors | null {
  return Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)(control);
}
