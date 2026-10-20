import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {ConfirmDialogData} from './confirm-dialog-types';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-confirm-dialog',
  imports: [
    MatDialogTitle,
    TranslatePipe,
    MatDialogActions,
    MatButton,
    MatDialogContent
  ],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialog {
  public readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialog>);

  protected cancel(): void {
    this.dialogRef.close(false);
  }

  protected accept(): void {
    this.dialogRef.close(true);
  }
}
