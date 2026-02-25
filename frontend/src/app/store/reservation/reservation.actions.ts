import { createAction, props } from '@ngrx/store';
import { ReservationModel } from '../../models/reservation.model';

export const loadMyReservations = createAction('[Reservation] Load My Reservations');

export const loadMyReservationsSuccess = createAction(
  '[Reservation] Load My Reservations Success',
  props<{ reservations: ReservationModel[] }>()
);

export const loadMyReservationsFailure = createAction(
  '[Reservation] Load My Reservations Failure',
  props<{ error: any }>()
);

export const reserveTrajet = createAction(
  '[Reservation] Reserve Trajet',
  props<{ trajetId: number }>()
);

export const reserveTrajetSuccess = createAction(
  '[Reservation] Reserve Trajet Success'
);

export const reserveTrajetFailure = createAction(
  '[Reservation] Reserve Trajet Failure',
  props<{ error: any }>()
);
