import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ReservationState } from './reservation.reducer';

export const selectReservationState = createFeatureSelector<ReservationState>('reservation');

export const selectMyReservations = createSelector(
  selectReservationState,
  (state) => state.myReservations
);

export const selectRideReservations = createSelector(
  selectReservationState,
  (state) => state.rideReservations
);

export const selectCurrentReservation = createSelector(
  selectReservationState,
  (state) => state.currentReservation
);

export const selectReservationLoading = createSelector(
  selectReservationState,
  (state) => state.loading
);

export const selectReserving = createSelector(
  selectReservationState,
  (state) => state.reserving
);

export const selectCancelling = createSelector(
  selectReservationState,
  (state) => state.cancelling
);

export const selectReservationError = createSelector(
  selectReservationState,
  (state) => state.error
);

export const selectReservationSuccessMessage = createSelector(
  selectReservationState,
  (state) => state.successMessage
);

export const selectIsAlreadyReserved = createSelector(
  selectReservationState,
  (state) => state.currentReservation !== null
);

export const selectMyReservationsCount = createSelector(
  selectMyReservations,
  (reservations) => reservations.length
);
