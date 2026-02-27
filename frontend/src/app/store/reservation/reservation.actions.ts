import { createAction, props } from '@ngrx/store';
import { ReservationDto } from '../../services/reservation.service';

export const loadMyReservations = createAction('[Reservation] Load My Reservations');
export const loadMyReservationsSuccess = createAction('[Reservation] Load My Reservations Success', props<{ reservations: ReservationDto[] }>());
export const loadMyReservationsFailure = createAction('[Reservation] Load My Reservations Failure', props<{ error: string }>());

export const loadRideReservations = createAction('[Reservation] Load Ride Reservations', props<{ rideId: number }>());
export const loadRideReservationsSuccess = createAction('[Reservation] Load Ride Reservations Success', props<{ reservations: ReservationDto[] }>());
export const loadRideReservationsFailure = createAction('[Reservation] Load Ride Reservations Failure', props<{ error: string }>());

export const reserveRide = createAction('[Reservation] Reserve Ride', props<{ rideId: number }>());
export const reserveRideSuccess = createAction('[Reservation] Reserve Ride Success', props<{ reservation: ReservationDto }>());
export const reserveRideFailure = createAction('[Reservation] Reserve Ride Failure', props<{ error: string }>());

export const cancelReservation = createAction('[Reservation] Cancel Reservation', props<{ reservationId: number }>());
export const cancelReservationSuccess = createAction('[Reservation] Cancel Reservation Success', props<{ reservationId: number }>());
export const cancelReservationFailure = createAction('[Reservation] Cancel Reservation Failure', props<{ error: string }>());

export const checkAlreadyReserved = createAction('[Reservation] Check Already Reserved', props<{ rideId: number }>());
export const checkAlreadyReservedSuccess = createAction('[Reservation] Check Already Reserved Success', props<{ reservation: ReservationDto | null }>());
export const checkAlreadyReservedFailure = createAction('[Reservation] Check Already Reserved Failure', props<{ error: string }>());

export const clearReservationState = createAction('[Reservation] Clear State');
export const clearReservationMessages = createAction('[Reservation] Clear Messages');
