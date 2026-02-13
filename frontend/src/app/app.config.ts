import {ApplicationConfig, isDevMode, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideHttpClient, withFetch, withInterceptors} from '@angular/common/http';
import {routes} from './app.routes';
import {authInterceptor} from './interceptors/auth.interceptor';
import {provideStore} from "@ngrx/store";
import {provideStoreDevtools} from "@ngrx/store-devtools";
import {UserEffects} from "./store/user/user.effects";
import {TrajetEffects} from "./store/trajet/trajet.effects";
import {provideEffects} from "@ngrx/effects";
import {trajetReducer} from "./store/trajet/trajet.reducer";
import {userReducer} from "./store/user/user.reducer";
import {AuthentificationEffects} from "./store/authentification/authentification.effects";
import {authentificationReducer} from "./store/authentification/authentification.reducer";
import {provideServiceWorker} from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({eventCoalescing: true}),
        provideRouter(routes),
        provideHttpClient(withFetch(), withInterceptors([authInterceptor])),

        // Configuration NgRx
        provideStore({
            user: userReducer,
            trajet: trajetReducer,
            auth: authentificationReducer
        }),
        provideEffects([UserEffects, TrajetEffects, AuthentificationEffects]),
        provideStoreDevtools({maxAge: 25, logOnly: !isDevMode()}),
        provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
        })
    ]
};
