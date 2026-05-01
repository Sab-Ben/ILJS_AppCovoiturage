import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TrajetState } from './trajet.reducer';

export const selectTrajetState = createFeatureSelector<TrajetState>('trajet');

export const selectAllTrajets = createSelector(
    selectTrajetState,
    (state) => state.trajets
);

export const selectTrajetsLoading = createSelector(
    selectTrajetState,
    (state) => state.loading
);

export const selectTrajetError = createSelector(
    selectTrajetState,
    (state) => state.error
);