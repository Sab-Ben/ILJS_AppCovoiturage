import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { TrajetService } from '../../services/trajet.service';
import * as TrajetActions from './trajet.actions';

@Injectable()
export class TrajetEffects {
    private actions$ = inject(Actions);
    private trajetService = inject(TrajetService);

    loadTrajets$ = createEffect(() => this.actions$.pipe(
        ofType(TrajetActions.loadTrajets),
        mergeMap(() => this.trajetService.getMyTrajets().pipe(
            // SUCCÈS : On sauvegarde les données fraîches dans le localStorage
            tap(trajets => {
                try {
                    localStorage.setItem('offline_trajets', JSON.stringify(trajets));
                } catch (e) {
                    console.error('Impossible de sauvegarder les trajets en local', e);
                }
            }),
            map(trajets => TrajetActions.loadTrajetsSuccess({ trajets })),

            // ÉCHEC (Offline ou Erreur Serveur) : On tente de récupérer le cache
            catchError(error => {
                console.warn('Mode hors ligne ou erreur API détectée : ', error);

                const cachedTrajets = localStorage.getItem('offline_trajets');

                if (cachedTrajets) {
                    try {
                        // Si on a des données en cache, on fait comme si c'était un succès
                        const trajets = JSON.parse(cachedTrajets);
                        return of(TrajetActions.loadTrajetsSuccess({ trajets }));
                    } catch (e) {
                        console.error('Erreur de lecture du cache', e);
                    }
                }

                // Si aucun cache n'est disponible, on renvoie l'erreur normale
                return of(TrajetActions.loadTrajetsFailure({ error }));
            })
        ))
    ));

    createTrajet$ = createEffect(() => this.actions$.pipe(
        ofType(TrajetActions.createTrajet),
        mergeMap(({ trajet }) => this.trajetService.createTrajet(trajet).pipe(
            map(newTrajet => TrajetActions.createTrajetSuccess({ trajet: newTrajet })),
            catchError(error => of(TrajetActions.createTrajetFailure({ error })))
        ))
    ));

    deleteTrajet$ = createEffect(() => this.actions$.pipe(
        ofType(TrajetActions.deleteTrajet),
        mergeMap(({ id }) => this.trajetService.deleteTrajet(id).pipe(
            map(() => TrajetActions.deleteTrajetSuccess({ id })),
            catchError(error => of(TrajetActions.deleteTrajetFailure({ error })))
        ))
    ));
}