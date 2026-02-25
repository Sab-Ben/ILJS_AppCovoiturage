import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as ReservationActions from './reservation.actions';
import { ReservationService } from '../../services/reservation.service';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';

@Injectable()
export class ReservationEffects {
  constructor(private actions$: Actions, private reservationService: ReservationService) {}

  loadMyReservations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReservationActions.loadMyReservations),
      switchMap(() =>
        this.reservationService.getMyReservations().pipe(
          map((reservations) => ReservationActions.loadMyReservationsSuccess({ reservations })),
          catchError((error) => of(ReservationActions.loadMyReservationsFailure({ error })))
        )
      )
    )
  );

  reserveTrajet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReservationActions.reserveTrajet),
      mergeMap(({ trajetId }) =>
        this.reservationService.reserveTrajet(trajetId).pipe(
          // après réservation OK, on refresh la liste
          mergeMap(() => [
            ReservationActions.reserveTrajetSuccess(),
            ReservationActions.loadMyReservations()
          ]),
          catchError((error) => of(ReservationActions.reserveTrajetFailure({ error })))
        )
      )
    )
  );
}
