import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './authentification.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectIsAuthenticated = createSelector(
    selectAuthState,
    (state) => state.isAuthenticated
);

export const selectAuthToken = createSelector(
    selectAuthState,
    (state) => state.token
);

export const selectAuthLoading = createSelector(
    selectAuthState,
    (state) => state.loading
);

export const selectAuthError = createSelector(
    selectAuthState,
    (state) => state.error
);