import { Injectable, inject } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class PaginatorIntlService extends MatPaginatorIntl {
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

  public override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    if (length === 0 || pageSize === 0) {
      const zero = this.translateService.instant('paginator.rangeZero', { length });
      return zero !== 'paginator.rangeZero' ? zero : `0 of ${length}`;
    }
    const startIndex = page * pageSize;
    const endIndex =
      startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    const range = this.translateService.instant('paginator.range', {
      start: startIndex + 1,
      end: endIndex,
      length,
    });
    return range !== 'paginator.range' ? range : `${startIndex + 1} – ${endIndex} of ${length}`;
  };

  private updateTranslations(): void {
    const itemsPerPage = this.translateService.instant('paginator.itemsPerPage');
    this.itemsPerPageLabel =
      itemsPerPage !== 'paginator.itemsPerPage' ? itemsPerPage : 'Items per page:';

    const nextPage = this.translateService.instant('paginator.nextPage');
    this.nextPageLabel = nextPage !== 'paginator.nextPage' ? nextPage : 'Next page';

    const previousPage = this.translateService.instant('paginator.previousPage');
    this.previousPageLabel =
      previousPage !== 'paginator.previousPage' ? previousPage : 'Previous page';

    const firstPage = this.translateService.instant('paginator.firstPage');
    this.firstPageLabel = firstPage !== 'paginator.firstPage' ? firstPage : 'First page';

    const lastPage = this.translateService.instant('paginator.lastPage');
    this.lastPageLabel = lastPage !== 'paginator.lastPage' ? lastPage : 'Last page';

    this.changes.next();
  }
}
