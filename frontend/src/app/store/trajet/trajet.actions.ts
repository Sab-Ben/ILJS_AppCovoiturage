import { createAction, props } from '@ngrx/store';
import { Trajet } from '../../models/trajet.model';

export const loadTrajets = createAction('[Trajet] Load My Trajets');
export const loadTrajetsSuccess = createAction('[Trajet] Load My Trajets Success', props<{ trajets: Trajet[] }>());
export const loadTrajetsFailure = createAction('[Trajet] Load My Trajets Failure', props<{ error: any }>());

export const createTrajet = createAction('[Trajet] Create Trajet', props<{ trajet: Trajet }>());
export const createTrajetSuccess = createAction('[Trajet] Create Trajet Success', props<{ trajet: Trajet }>());
export const createTrajetFailure = createAction('[Trajet] Create Trajet Failure', props<{ error: any }>());

export const deleteTrajet = createAction('[Trajet] Delete Trajet', props<{ id: number }>());
export const deleteTrajetSuccess = createAction('[Trajet] Delete Trajet Success', props<{ id: number }>());
export const deleteTrajetFailure = createAction('[Trajet] Delete Trajet Failure', props<{ error: any }>());