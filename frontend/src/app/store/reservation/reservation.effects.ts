import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, mergeMap } from 'rxjs/operators';
import { ReservationService } from '../../services/reservation.service';
import * as ReservationActions from './reservation.actions';

@Injectable()
export class ReservationEffects {
  private actions$ = inject(Actions);
  private reservationService = inject(ReservationService);

  loadMyReservations$ = createEffect(() => this.actions$.pipe(
    ofType(ReservationActions.loadMyReservations),
    switchMap(() => this.reservationService.getMyReservations().pipe(
      map(reservations => ReservationActions.loadMyReservationsSuccess({ reservations })),
      catchError(error => of(ReservationActions.loadMyReservationsFailure({
        error: error?.error?.message || error?.message || 'Erreur lors du chargement des réservations'
      })))
    ))
  ));

  loadRideReservations$ = createEffect(() => this.actions$.pipe(
    ofType(ReservationActions.loadRideReservations),
    switchMap(({ rideId }) => this.reservationService.getReservationsByRide(rideId).pipe(
      map(reservations => ReservationActions.loadRideReservationsSuccess({ reservations })),
      catchError(error => of(ReservationActions.loadRideReservationsFailure({
        error: error?.error?.message || error?.message || 'Erreur lors du chargement des réservations du trajet'
      })))
    ))
  ));

  reserveRide$ = createEffect(() => this.actions$.pipe(
    ofType(ReservationActions.reserveRide),
    mergeMap(({ rideId }) => this.reservationService.reserveRide(rideId).pipe(
      map(reservation => ReservationActions.reserveRideSuccess({ reservation })),
      catchError(error => of(ReservationActions.reserveRideFailure({
        error: error?.error?.message || error?.message || 'Erreur lors de la réservation'
      })))
    ))
  ));

  cancelReservation$ = createEffect(() => this.actions$.pipe(
    ofType(ReservationActions.cancelReservation),
    mergeMap(({ reservationId }) => this.reservationService.cancelReservation(reservationId).pipe(
      map(() => ReservationActions.cancelReservationSuccess({ reservationId })),
      catchError(error => of(ReservationActions.cancelReservationFailure({
        error: error?.error?.message || error?.message || 'Erreur lors de l\'annulation'
      })))
    ))
  ));

  checkAlreadyReserved$ = createEffect(() => this.actions$.pipe(
    ofType(ReservationActions.checkAlreadyReserved),
    switchMap(({ rideId }) => this.reservationService.getMyReservationForRide(rideId).pipe(
      map(reservation => ReservationActions.checkAlreadyReservedSuccess({ reservation })),
      catchError(error => of(ReservationActions.checkAlreadyReservedFailure({
        error: error?.error?.message || error?.message || 'Erreur de vérification'
      })))
    ))
  ));
}
