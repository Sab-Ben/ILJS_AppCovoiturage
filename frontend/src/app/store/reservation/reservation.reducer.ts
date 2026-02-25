import { createReducer, on } from '@ngrx/store';
import * as ReservationActions from './reservation.actions';
import { ReservationModel } from '../../models/reservation.model';

export interface ReservationState {
  myReservations: ReservationModel[];
  loading: boolean;
  error: any;
}

export const initialState: ReservationState = {
  myReservations: [],
  loading: false,
  error: null
};

export const reservationReducer = createReducer(
  initialState,

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

  on(ReservationActions.reserveTrajet, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(ReservationActions.reserveTrajetSuccess, (state) => ({
    ...state,
    loading: false
  })),

  on(ReservationActions.reserveTrajetFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
