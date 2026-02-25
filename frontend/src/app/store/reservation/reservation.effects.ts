import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ReservationService } from '../../services/reservation.service';
import * as ReservationActions from './reservation.actions';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class ReservationEffects {
    private actions$ = inject(Actions);
    private reservationService = inject(ReservationService);

    loadReservations$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ReservationActions.loadReservations),
            mergeMap(action =>
                this.reservationService.getMyReservations(action.status).pipe(
                    map(reservations => ReservationActions.loadReservationsSuccess({ reservations, status: action.status })),
                    catchError(error => of(ReservationActions.loadReservationsFailure({ error })))
                )
            )
        )
    );

    cancelReservation$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ReservationActions.cancelReservation),
            mergeMap(action =>
                this.reservationService.cancelReservation(action.id).pipe(
                    map(() => ReservationActions.cancelReservationSuccess({ id: action.id })),
                    catchError(error => of(ReservationActions.cancelReservationFailure({ error })))
                )
            )
        )
    );

    createReservation$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ReservationActions.createReservation),
            mergeMap(action =>
                this.reservationService.createReservation(action.payload).pipe(
                    map(reservation => ReservationActions.createReservationSuccess({ reservation })),
                    catchError(error => of(ReservationActions.createReservationFailure({ error })))
                )
            )
        )
    );
}