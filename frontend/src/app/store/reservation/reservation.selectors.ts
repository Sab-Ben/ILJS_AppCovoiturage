import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ReservationState } from './reservation.reducer';

export const selectReservationState = createFeatureSelector<ReservationState>('reservation');

export const selectReservedReservations = createSelector(
    selectReservationState,
    (state: ReservationState) => state.reserved
);

export const selectCompletedReservations = createSelector(
    selectReservationState,
    (state: ReservationState) => state.completed
);

export const selectReservationLoading = createSelector(
    selectReservationState,
    (state: ReservationState) => state.loading
);

export const selectReservationError = createSelector(
    selectReservationState,
    (state: ReservationState) => state.error
);