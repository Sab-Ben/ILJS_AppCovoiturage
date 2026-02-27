import { ApplicationConfig, isDevMode, provideZoneChangeDetection, importProvidersFrom, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideServiceWorker } from '@angular/service-worker';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { LanguageService } from './services/language.service';

import { userReducer } from './store/user/user.reducer';
import { trajetReducer } from './store/trajet/trajet.reducer';
import { authentificationReducer } from './store/authentification/authentification.reducer';

import { UserEffects } from './store/user/user.effects';
import { TrajetEffects } from './store/trajet/trajet.effects';
import { AuthentificationEffects } from './store/authentification/authentification.effects';

import { messageReducer } from './store/message/message.reducer';
import { notificationReducer } from './store/notification/notification.reducer';
import { pointReducer } from './store/point/point.reducer';
import { reservationReducer } from './store/reservation/reservation.reducer';
import { MessageEffects } from './store/message/message.effects';
import { NotificationEffects } from './store/notification/notification.effects';
import { PointEffects } from './store/point/point.effects';
import { ReservationEffects } from './store/reservation/reservation.effects';

function httpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

function initLanguage(languageService: LanguageService): () => void {
  return () => languageService.init();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),

    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'fr',
        loader: {
          provide: TranslateLoader,
          useFactory: httpLoaderFactory,
          deps: [HttpClient]
        }
      })
    ),

    {
      provide: APP_INITIALIZER,
      useFactory: initLanguage,
      deps: [LanguageService],
      multi: true
    },

    provideStore({
      user: userReducer,
      trajet: trajetReducer,
      auth: authentificationReducer,
      message: messageReducer,
      notification: notificationReducer,
      point: pointReducer,
      reservation: reservationReducer
    }),

    provideEffects([
      UserEffects,
      TrajetEffects,
      AuthentificationEffects,
      MessageEffects,
      NotificationEffects,
      PointEffects,
      ReservationEffects
    ]),

    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),

    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
