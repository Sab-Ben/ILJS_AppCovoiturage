import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PointState } from './point.reducer';

export const selectPointState = createFeatureSelector<PointState>('point');

export const selectBalance = createSelector(
    selectPointState,
    (state) => state.balance
);

export const selectTransactions = createSelector(
    selectPointState,
    (state) => state.transactions
);

export const selectBalanceLoading = createSelector(
    selectPointState,
    (state) => state.balanceLoading
);

export const selectHistoryLoading = createSelector(
    selectPointState,
    (state) => state.historyLoading
);

export const selectPointError = createSelector(
    selectPointState,
    (state) => state.error
);

export const selectCurrentLevel = createSelector(
    selectBalance,
    (balance) => balance?.level ?? 'DEBUTANT'
);

export const selectLevelProgressPercent = createSelector(
    selectBalance,
    (balance) => balance?.levelProgressPercent ?? 0
);
