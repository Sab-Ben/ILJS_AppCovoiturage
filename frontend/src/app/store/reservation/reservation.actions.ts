import { createAction, props } from '@ngrx/store';
import { Reservation, ReservationStatus } from '../../models/reservation.model';

export interface CreateReservationRequest {
    rideId: number;
    seats: number;
    desiredRoute: string;
}

// Chargement
export const loadReservations = createAction(
    '[Reservation] Load Reservations',
    props<{ status: ReservationStatus }>()
);

export const loadReservationsSuccess = createAction(
    '[Reservation] Load Reservations Success',
    props<{ reservations: Reservation[], status: ReservationStatus }>()
);

export const loadReservationsFailure = createAction(
    '[Reservation] Load Reservations Failure',
    props<{ error: any }>()
);

// Annulation
export const cancelReservation = createAction(
    '[Reservation] Cancel Reservation',
    props<{ id: number }>()
);

export const cancelReservationSuccess = createAction(
    '[Reservation] Cancel Reservation Success',
    props<{ id: number }>()
);

export const cancelReservationFailure = createAction(
    '[Reservation] Cancel Reservation Failure',
    props<{ error: any }>()
);


export const createReservation = createAction(
    '[Reservation] Create Reservation',
    props<{ payload: CreateReservationRequest }>()
);

export const createReservationSuccess = createAction(
    '[Reservation] Create Reservation Success',
    props<{ reservation: Reservation }>()
);

export const createReservationFailure = createAction(
    '[Reservation] Create Reservation Failure',
    props<{ error: any }>()
);