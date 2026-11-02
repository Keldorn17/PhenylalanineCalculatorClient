import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'terms-and-privacy',
  imports: [MatCardModule, MatIconModule, MatDividerModule],
  templateUrl: './terms-and-privacy.html',
  styleUrl: './terms-and-privacy.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsAndPrivacy {}
