import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '../translation/translation-pipe';
import {AuthService} from '../auth/auth-service';

@Component({
  selector: 'landing',
  imports: [
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Landing {
  protected authService = inject(AuthService);
}
