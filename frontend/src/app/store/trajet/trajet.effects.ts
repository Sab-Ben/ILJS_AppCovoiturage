import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { TrajetService } from '../../services/trajet.service';
import * as TrajetActions from './trajet.actions';

@Injectable()
export class TrajetEffects {
    private actions$ = inject(Actions);
    private trajetService = inject(TrajetService);

    loadTrajets$ = createEffect(() => this.actions$.pipe(
        ofType(TrajetActions.loadTrajets),
        mergeMap(() => this.trajetService.getMyTrajets().pipe(
            map(trajets => TrajetActions.loadTrajetsSuccess({ trajets })),
            catchError(error => of(TrajetActions.loadTrajetsFailure({ error })))
        ))
    ));

    createTrajet$ = createEffect(() => this.actions$.pipe(
        ofType(TrajetActions.createTrajet),
        mergeMap(({ trajet }) => this.trajetService.createTrajet(trajet).pipe(
            map(newTrajet => TrajetActions.createTrajetSuccess({ trajet: newTrajet })),
            catchError(error => of(TrajetActions.createTrajetFailure({ error })))
        ))
    ));

    deleteTrajet$ = createEffect(() => this.actions$.pipe(
        ofType(TrajetActions.deleteTrajet),
        mergeMap(({ id }) => this.trajetService.deleteTrajet(id).pipe(
            map(() => TrajetActions.deleteTrajetSuccess({ id })),
            catchError(error => of(TrajetActions.deleteTrajetFailure({ error })))
        ))
    ));
}