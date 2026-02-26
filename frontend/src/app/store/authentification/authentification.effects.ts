import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './authentification.actions';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthentificationEffects {
    private actions$ = inject(Actions);
    private authService = inject(AuthService);
    private router = inject(Router);

    login$ = createEffect(() => this.actions$.pipe(
        ofType(AuthActions.login),
        mergeMap(({ authRequest }) => this.authService.login(authRequest).pipe(
            map(response => AuthActions.loginSuccess({ token: response.token })),
            catchError(error => of(AuthActions.loginFailure({ error })))
        ))
    ));

    register$ = createEffect(() => this.actions$.pipe(
        ofType(AuthActions.register),
        mergeMap(({ registerRequest }) => this.authService.register(registerRequest).pipe(
            map(() => AuthActions.registerSuccess()),
            tap(() => this.router.navigate(['/auth'])),
            catchError(error => of(AuthActions.registerFailure({ error })))
        ))
    ));

    logout$ = createEffect(() => this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => this.authService.logout()) // Le service gère déjà le sessionStorage et la redirection
    ), { dispatch: false });

    initAuth$ = createEffect(() => this.actions$.pipe(
        ofType(AuthActions.initAuth),
        map(() => {
            const token = this.authService.getToken();
            if (token) {
                return AuthActions.loginSuccess({ token });
            }
            return { type: '[Auth] No Token Found' }; // Action "dummy" ou rien
        })
    ));
}