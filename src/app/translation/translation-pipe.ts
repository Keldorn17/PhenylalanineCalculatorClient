import {Pipe, PipeTransform, inject} from '@angular/core';
import {TranslationService} from './translation-service';

@Pipe({
  name: 'translate',
  pure: false,
  standalone: true
})
export class TranslatePipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);

  public transform(key: string | null | undefined, params?: Record<string, string>): string {
    if (!key) {
      return '';
    }
    return this.translationService.translate(key, params);
  }
}
