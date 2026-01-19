import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { LOCALE_ID,DEFAULT_CURRENCY_CODE } from '@angular/core';
 
registerLocaleData(localeEs);
export const appConfig: ApplicationConfig = {
    providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {provide: LOCALE_ID, useValue: 'es-ES' },
    {provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' }
  ]
};
