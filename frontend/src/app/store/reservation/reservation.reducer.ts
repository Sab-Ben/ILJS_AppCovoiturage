import { createReducer, on } from '@ngrx/store';
import * as ReservationActions from './reservation.actions';
import { Reservation } from '../../models/reservation.model';

export interface ReservationState {
    reserved: Reservation[];
    completed: Reservation[];
    loading: boolean;
    error: any;
}

export const initialState: ReservationState = {
    reserved: [],
    completed: [],
    loading: false,
    error: null
};

export const reservationReducer = createReducer(
    initialState,

    on(ReservationActions.loadReservations, (state) => ({ ...state, loading: true, error: null })),
    on(ReservationActions.loadReservationsSuccess, (state, { reservations, status }) => {
        if (status === 'RESERVED') {
            return { ...state, reserved: reservations, loading: false };
        } else if (status === 'COMPLETED') {
            return { ...state, completed: reservations, loading: false };
        }
        return { ...state, loading: false };
    }),
    on(ReservationActions.loadReservationsFailure, (state, { error }) => ({ ...state, error, loading: false })),

    on(ReservationActions.cancelReservation, (state) => ({ ...state, loading: true, error: null })),
    on(ReservationActions.cancelReservationSuccess, (state, { id }) => ({
        ...state,

        reserved: state.reserved.filter(r => r.id !== id),
        loading: false
    })),
    on(ReservationActions.cancelReservationFailure, (state, { error }) => ({ ...state, error, loading: false }))
);