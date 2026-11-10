import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatPaginatorIntl } from '@angular/material/paginator';
import {
  OwlDateTimeIntl,
  OwlDateTimeModule,
  OwlNativeDateTimeModule,
} from '@danielmoncada/angular-datetime-picker';

import { routes } from './app.routes';
import { authInterceptor } from './auth/auth-interceptor';
import { PaginatorIntlService } from './paginator/paginator-intl-service';
import { DateTimeIntlService } from './date-time-picker/date-time-intl-service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideNativeDateAdapter(),
    importProvidersFrom(OwlDateTimeModule, OwlNativeDateTimeModule),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: './i18n/',
        suffix: '.json',
      }),
      fallbackLang: 'en',
    }),
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        subscriptSizing: 'dynamic',
      },
    },
    {
      provide: MatPaginatorIntl,
      useClass: PaginatorIntlService,
    },
    {
      provide: OwlDateTimeIntl,
      useClass: DateTimeIntlService,
    },
  ],
};
