// frontend/src/app/store/trajet/trajet.effects.ts
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, switchMap, of, tap } from 'rxjs';
import { TrajetService } from '../../services/trajet.service';
import * as TrajetActions from './trajet.actions';
import { OfflineQueueService } from '../../services/offline-queue.service';

@Injectable()
export class TrajetEffects {
    private actions$ = inject(Actions);
    private trajetService = inject(TrajetService);
    private offlineQueue = inject(OfflineQueueService);

    loadTrajets$ = createEffect(() => this.actions$.pipe(
        ofType(TrajetActions.loadTrajets),
        switchMap(() => this.trajetService.getMyTrajets().pipe(
            tap(trajets => localStorage.setItem('offline_trajets', JSON.stringify(trajets))),
            map(trajets => TrajetActions.loadTrajetsSuccess({ trajets })),
            catchError(error => {
                const cached = localStorage.getItem('offline_trajets');
                if (cached) {
                    return of(TrajetActions.loadTrajetsSuccess({ trajets: JSON.parse(cached) }));
                }
                return of(TrajetActions.loadTrajetsFailure({ error }));
            })
        ))
    ));

    createTrajet$ = createEffect(() => this.actions$.pipe(
        ofType(TrajetActions.createTrajet),
        mergeMap((action) => {
            if (!navigator.onLine) {
                this.offlineQueue.enqueueAction(action);
                // On retourne une action "Dummy" ou une action de succès temporaire pour l'UI
                return of({ type: '[Trajet] Create Trajet Offline Queued' });
            }

            return this.trajetService.createTrajet(action.trajet).pipe(
                map(newTrajet => TrajetActions.createTrajetSuccess({ trajet: newTrajet })),
                catchError(error => {
                    if (error.status === 0) { // Erreur réseau
                        this.offlineQueue.enqueueAction(action);
                        return of({ type: '[Trajet] Create Trajet Offline Queued' });
                    }
                    return of(TrajetActions.createTrajetFailure({ error }));
                })
            );
        })
    ));

    deleteTrajet$ = createEffect(() => this.actions$.pipe(
        ofType(TrajetActions.deleteTrajet),
        mergeMap((action) => {
            if (!navigator.onLine) {
                this.offlineQueue.enqueueAction(action);
                return of({ type: '[Trajet] Delete Trajet Offline Queued' });
            }

            return this.trajetService.deleteTrajet(action.id).pipe(
                map(() => TrajetActions.deleteTrajetSuccess({ id: action.id })),
                catchError(error => {
                    if (error.status === 0) {
                        this.offlineQueue.enqueueAction(action);
                        return of({ type: '[Trajet] Delete Trajet Offline Queued' });
                    }
                    return of(TrajetActions.deleteTrajetFailure({ error }));
                })
            );
        })
    ));
}