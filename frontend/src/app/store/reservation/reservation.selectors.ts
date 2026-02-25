import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ReservationState } from './reservation.reducer';

export const selectReservationState =
  createFeatureSelector<ReservationState>('reservation');

export const selectMyReservations = createSelector(
  selectReservationState,
  (state) => state.myReservations
);

export const selectReservationLoading = createSelector(
  selectReservationState,
  (state) => state.loading
);

export const selectReservationError = createSelector(
  selectReservationState,
  (state) => state.error
);
