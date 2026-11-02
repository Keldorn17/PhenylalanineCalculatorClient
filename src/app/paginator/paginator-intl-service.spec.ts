import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { EventEmitter } from '@angular/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { PaginatorIntlService } from './paginator-intl-service';

describe('PaginatorIntlService', () => {
  let service: PaginatorIntlService;
  let mockTranslateService: {
    instant: (key: string, interpolateParams?: Record<string, unknown>) => string;
    onLangChange: EventEmitter<{ lang: string }>;
    onTranslationChange: EventEmitter<unknown>;
  };

  beforeEach(() => {
    mockTranslateService = {
      instant: (key: string, params?: Record<string, unknown>) => {
        const translations: Record<string, string> = {
          'paginator.itemsPerPage': 'Items per page:',
          'paginator.nextPage': 'Next page',
          'paginator.previousPage': 'Previous page',
          'paginator.firstPage': 'First page',
          'paginator.lastPage': 'Last page',
          'paginator.rangeZero': `0 of ${ params?.['length'] }`,
          'paginator.range': `${ params?.['start'] } – ${ params?.['end'] } of ${ params?.['length'] }`
        };
        return translations[key] ?? key;
      },
      onLangChange: new EventEmitter<{ lang: string }>(),
      onTranslationChange: new EventEmitter<unknown>()
    };

    TestBed.configureTestingModule({
      providers: [
        PaginatorIntlService,
        {provide: TranslateService, useValue: mockTranslateService}
      ]
    });

    service = TestBed.inject(PaginatorIntlService);
  });

  it('should initialize translated labels', () => {
    expect(service.itemsPerPageLabel).toBe('Items per page:');
    expect(service.nextPageLabel).toBe('Next page');
    expect(service.previousPageLabel).toBe('Previous page');
    expect(service.firstPageLabel).toBe('First page');
    expect(service.lastPageLabel).toBe('Last page');
  });

  it('should format range label correctly for empty length', () => {
    expect(service.getRangeLabel(0, 10, 0)).toBe('0 of 0');
  });

  it('should format range label correctly for multiple pages', () => {
    expect(service.getRangeLabel(0, 10, 25)).toBe('1 – 10 of 25');
    expect(service.getRangeLabel(1, 10, 25)).toBe('11 – 20 of 25');
    expect(service.getRangeLabel(2, 10, 25)).toBe('21 – 25 of 25');
  });

  it('should update labels when lang changes', () => {
    mockTranslateService.instant = (key: string) => {
      if (key === 'paginator.itemsPerPage') return 'Elemek száma oldalanként:';
      return key;
    };

    mockTranslateService.onLangChange.emit({lang: 'hu'});
    expect(service.itemsPerPageLabel).toBe('Elemek száma oldalanként:');
  });
});
