import { createReducer, on } from '@ngrx/store';
import { Trajet } from '../../models/trajet.model';
import * as TrajetActions from './trajet.actions';

export interface TrajetState {
    trajets: Trajet[];
    loading: boolean;
    error: any;
}

export const initialState: TrajetState = {
    trajets: [],
    loading: false,
    error: null
};

export const trajetReducer = createReducer(
    initialState,
    on(TrajetActions.loadTrajets, TrajetActions.createTrajet, TrajetActions.deleteTrajet, (state) => ({ ...state, loading: true })),

    on(TrajetActions.loadTrajetsSuccess, (state, { trajets }) => ({
        ...state,
        loading: false,
        trajets
    })),

    on(TrajetActions.createTrajetSuccess, (state, { trajet }) => ({
        ...state,
        loading: false,
        trajets: [...state.trajets, trajet] // Ajout immuable
    })),

    on(TrajetActions.deleteTrajetSuccess, (state, { id }) => ({
        ...state,
        loading: false,
        trajets: state.trajets.filter(t => t.id !== id) // Suppression immuable
    })),

    on(TrajetActions.loadTrajetsFailure, TrajetActions.createTrajetFailure, TrajetActions.deleteTrajetFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    }))
);