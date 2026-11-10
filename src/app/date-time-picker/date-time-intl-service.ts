import { Injectable, inject } from '@angular/core';
import { OwlDateTimeIntl } from '@danielmoncada/angular-datetime-picker';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class DateTimeIntlService extends OwlDateTimeIntl {
  private readonly translateService = inject(TranslateService);

  constructor() {
    super();
    this.translateService.onLangChange.subscribe(() => {
      this.updateTranslations();
    });
    this.translateService.onTranslationChange.subscribe(() => {
      this.updateTranslations();
    });
    this.updateTranslations();
  }

  private updateTranslations(): void {
    const cancel = this.translateService.instant('dialog.cancel');
    this.cancelBtnLabel = cancel !== 'dialog.cancel' ? cancel : 'Cancel';

    const set = this.translateService.instant('dateTimePicker.set');
    this.setBtnLabel = set !== 'dateTimePicker.set' ? set : 'Save';

    this.changes.next();
  }
}
