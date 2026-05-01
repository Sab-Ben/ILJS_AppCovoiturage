import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { PointService } from '../../services/point.service';
import * as PointActions from './point.actions';

@Injectable()
export class PointEffects {
    private actions$ = inject(Actions);
    private pointService = inject(PointService);

    loadBalance$ = createEffect(() => this.actions$.pipe(
        ofType(PointActions.loadBalance),
        mergeMap(() => this.pointService.getBalance().pipe(
            map(balance => PointActions.loadBalanceSuccess({ balance })),
            catchError(error => of(PointActions.loadBalanceFailure({ error: error.message })))
        ))
    ));

    loadHistory$ = createEffect(() => this.actions$.pipe(
        ofType(PointActions.loadHistory),
        mergeMap(() => this.pointService.getHistory().pipe(
            map(transactions => PointActions.loadHistorySuccess({ transactions })),
            catchError(error => of(PointActions.loadHistoryFailure({ error: error.message })))
        ))
    ));
}
