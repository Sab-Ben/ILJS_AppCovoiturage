import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

import { userReducer } from './store/user/user.reducer';
import { trajetReducer } from './store/trajet/trajet.reducer';
import { authentificationReducer } from './store/authentification/authentification.reducer';

import { UserEffects } from './store/user/user.effects';
import { TrajetEffects } from './store/trajet/trajet.effects';
import { AuthentificationEffects } from './store/authentification/authentification.effects';

import { messageReducer } from './store/message/message.reducer';
import { notificationReducer } from './store/notification/notification.reducer';
import { pointReducer } from './store/point/point.reducer';
import { MessageEffects } from './store/message/message.effects';
import { NotificationEffects } from './store/notification/notification.effects';
import { PointEffects } from './store/point/point.effects';
import {OfflineEffects} from "./store/offline/offline.effects";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),

    provideStore({
      user: userReducer,
      trajet: trajetReducer,
      auth: authentificationReducer,
      message: messageReducer,
      notification: notificationReducer,
      point: pointReducer
    }),

    provideEffects([
      UserEffects,
      TrajetEffects,
      AuthentificationEffects,
      MessageEffects,
      NotificationEffects,
      OfflineEffects,
      PointEffects
    ]),

    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),

    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
