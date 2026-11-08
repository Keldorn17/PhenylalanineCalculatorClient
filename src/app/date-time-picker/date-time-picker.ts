import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  DateTimeAdapter,
  OwlDateTimeModule,
  OwlNativeDateTimeModule,
  PickerMode,
  PickerType
} from '@danielmoncada/angular-datetime-picker';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'date-time-picker',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    TranslatePipe
  ],
  templateUrl: './date-time-picker.html',
  styleUrl: './date-time-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateTimePicker {
  private readonly dateTimeAdapter = inject<DateTimeAdapter<Date>>(DateTimeAdapter);
  private readonly translateService = inject(TranslateService);

  public readonly control = input.required<FormControl<Date | null>>();
  public readonly labelTranslateKey = input<string>('consumption.editDialog.dateTime');
  public readonly placeholderTranslateKey = input<string>('consumption.editDialog.dateTimePlaceholder');
  public readonly requiredErrorTranslateKey = input<string>('consumption.editDialog.errorDateTimeRequired');
  public readonly invalidErrorTranslateKey = input<string>('consumption.editDialog.errorDateTimeInvalid');
  public readonly pickerMode = input<PickerMode>('popup');
  public readonly pickerType = input<PickerType>('both');
  public readonly showSecondsTimer = input<boolean>(false);

  protected readonly currentLang = this.translateService.currentLang;
  protected readonly hour12Timer = computed(() => (this.currentLang() ?? 'en') !== 'hu');

  constructor() {
    effect(() => {
      const lang = this.currentLang() ?? 'en';
      this.dateTimeAdapter.setLocale(lang === 'hu' ? 'hu-HU' : 'en-US');
    });
  }
}
