import { createAction, props } from '@ngrx/store';
import { PointBalance } from '../../models/point-balance.model';
import { PointTransaction } from '../../models/point-transaction.model';

export const loadBalance = createAction('[Point] Load Balance');
export const loadBalanceSuccess = createAction('[Point] Load Balance Success', props<{ balance: PointBalance }>());
export const loadBalanceFailure = createAction('[Point] Load Balance Failure', props<{ error: string }>());

export const loadHistory = createAction('[Point] Load History');
export const loadHistorySuccess = createAction('[Point] Load History Success', props<{ transactions: PointTransaction[] }>());
export const loadHistoryFailure = createAction('[Point] Load History Failure', props<{ error: string }>());
