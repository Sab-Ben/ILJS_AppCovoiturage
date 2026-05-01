import { createReducer, on } from '@ngrx/store';
import { ReservationDto } from '../../services/reservation.service';
import * as ReservationActions from './reservation.actions';

export interface ReservationState {
  myReservations: ReservationDto[];
  rideReservations: ReservationDto[];
  currentReservation: ReservationDto | null;
  loading: boolean;
  reserving: boolean;
  cancelling: boolean;
  error: string | null;
  successMessage: string | null;
}

export const initialReservationState: ReservationState = {
  myReservations: [],
  rideReservations: [],
  currentReservation: null,
  loading: false,
  reserving: false,
  cancelling: false,
  error: null,
  successMessage: null
};

export const reservationReducer = createReducer(
  initialReservationState,

  on(ReservationActions.loadMyReservations, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ReservationActions.loadMyReservationsSuccess, (state, { reservations }) => ({
    ...state,
    loading: false,
    myReservations: reservations
  })),

  on(ReservationActions.loadMyReservationsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(ReservationActions.loadRideReservations, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ReservationActions.loadRideReservationsSuccess, (state, { reservations }) => ({
    ...state,
    loading: false,
    rideReservations: reservations
  })),

  on(ReservationActions.loadRideReservationsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(ReservationActions.reserveRide, (state) => ({
    ...state,
    reserving: true,
    error: null,
    successMessage: null
  })),

  on(ReservationActions.reserveRideSuccess, (state, { reservation }) => ({
    ...state,
    reserving: false,
    currentReservation: reservation,
    myReservations: [...state.myReservations, reservation],
    successMessage: 'RIDES.RESERVATION_CONFIRMED'
  })),

  on(ReservationActions.reserveRideFailure, (state, { error }) => ({
    ...state,
    reserving: false,
    error
  })),

  on(ReservationActions.cancelReservation, (state) => ({
    ...state,
    cancelling: true,
    error: null,
    successMessage: null
  })),

  on(ReservationActions.cancelReservationSuccess, (state, { reservationId }) => ({
    ...state,
    cancelling: false,
    currentReservation: null,
    myReservations: state.myReservations.filter(r => r.id !== reservationId),
    rideReservations: state.rideReservations.filter(r => r.id !== reservationId),
    successMessage: 'RIDES.CANCEL_RESERVATION_SUCCESS'
  })),

  on(ReservationActions.cancelReservationFailure, (state, { error }) => ({
    ...state,
    cancelling: false,
    error
  })),

  on(ReservationActions.checkAlreadyReserved, (state) => ({
    ...state,
    error: null
  })),

  on(ReservationActions.checkAlreadyReservedSuccess, (state, { reservation }) => ({
    ...state,
    currentReservation: reservation
  })),

  on(ReservationActions.checkAlreadyReservedFailure, (state, { error }) => ({
    ...state,
    error
  })),

  on(ReservationActions.clearReservationState, () => ({
    ...initialReservationState
  })),

  on(ReservationActions.clearReservationMessages, (state) => ({
    ...state,
    error: null,
    successMessage: null
  }))
);
