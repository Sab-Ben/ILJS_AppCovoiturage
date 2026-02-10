import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { UserService } from '../../services/user.service';
import * as UserActions from './user.actions';

@Injectable()
export class UserEffects {
    private actions$ = inject(Actions);
    private userService = inject(UserService);

    loadProfile$ = createEffect(() => this.actions$.pipe(
        ofType(UserActions.loadMyProfile),
        mergeMap(() => this.userService.getMyProfile().pipe( // Appel au service existant
            map(user => UserActions.loadMyProfileSuccess({ user })),
            catchError(error => of(UserActions.loadMyProfileFailure({ error })))
        ))
    ));

    updateProfile$ = createEffect(() => this.actions$.pipe(
        ofType(UserActions.updateProfile),
        mergeMap(({ user }) => this.userService.updateProfile(user).pipe(
            map((updatedUser) => UserActions.updateProfileSuccess({ user: updatedUser })),
            catchError(error => of(UserActions.updateProfileFailure({ error })))
        ))
    ));
}