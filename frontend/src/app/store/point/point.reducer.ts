import { createReducer, on } from '@ngrx/store';
import { PointBalance } from '../../models/point-balance.model';
import { PointTransaction } from '../../models/point-transaction.model';
import * as PointActions from './point.actions';

export interface PointState {
    balance: PointBalance | null;
    transactions: PointTransaction[];
    balanceLoading: boolean;
    historyLoading: boolean;
    error: string | null;
}

export const initialState: PointState = {
    balance: null,
    transactions: [],
    balanceLoading: false,
    historyLoading: false,
    error: null
};

export const pointReducer = createReducer(
    initialState,

    on(PointActions.loadBalance, (state) => ({
        ...state,
        balanceLoading: true,
        error: null
    })),
    on(PointActions.loadBalanceSuccess, (state, { balance }) => ({
        ...state,
        balance,
        balanceLoading: false
    })),
    on(PointActions.loadBalanceFailure, (state, { error }) => ({
        ...state,
        balanceLoading: false,
        error
    })),

    on(PointActions.loadHistory, (state) => ({
        ...state,
        historyLoading: true,
        error: null
    })),
    on(PointActions.loadHistorySuccess, (state, { transactions }) => ({
        ...state,
        transactions,
        historyLoading: false
    })),
    on(PointActions.loadHistoryFailure, (state, { error }) => ({
        ...state,
        historyLoading: false,
        error
    }))
);
