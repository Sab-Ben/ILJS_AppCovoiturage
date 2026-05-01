// frontend/src/app/store/offline.effects.ts
import {inject, Injectable} from '@angular/core';
import {createEffect} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {fromEvent, tap} from 'rxjs';
import {OfflineQueueService} from '../../services/offline-queue.service';

@Injectable()
export class OfflineEffects {
    private offlineService = inject(OfflineQueueService);
    private store = inject(Store);

    // Dès que le navigateur passe 'online', on vide la file d'attente
    syncOnOnline$ = createEffect(() =>
        fromEvent(window, 'online').pipe(
            tap(() => {
                const pendingActions = this.offlineService.consumeQueue();
                if (pendingActions.length > 0) {
                    console.log(`[Sync] Connexion rétablie. Synchronisation de ${pendingActions.length} actions...`);
                    pendingActions.forEach(action => this.store.dispatch(action));
                }
            })
        ), {dispatch: false}
    );
}