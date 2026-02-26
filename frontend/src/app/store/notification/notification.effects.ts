import {inject, Injectable} from '@angular/core';
import {Actions, createEffect} from '@ngrx/effects';
import {Store} from '@ngrx/store';
import {filter, switchMap, tap} from 'rxjs/operators';
import {selectAuthToken, selectIsAuthenticated} from '../authentification/authentification.selectors';
import * as NotificationActions from './notification.actions';
import {WsService} from '../../services/ws.service';

@Injectable()
export class NotificationEffects {
    private actions$ = inject(Actions);
    private store = inject(Store);
    private wsService = inject(WsService);

    /**
     * Initialise le chargement des notifications dès que l'utilisateur est authentifié.
     * switchMap renvoie ici un tableau d'actions qui seront toutes dispatchées.
     */
    initOnAuth$ = createEffect(() =>
        this.store.select(selectIsAuthenticated).pipe(
            filter(authenticated => authenticated),
            switchMap(() => [
                NotificationActions.loadNotifications(),
                NotificationActions.loadUnreadCount()
            ])
        )
    );

    /**
     * Gère la connexion au WebSocket dès qu'un token est disponible.
     * { dispatch: false } car cette action ne déclenche pas d'autre action NgRx.
     */
    connectWs$ = createEffect(() =>
            this.store.select(selectAuthToken).pipe(
                filter(token => !!token),
                tap(token => {
                    console.log('[NotificationEffects] Connexion au WS...');
                    this.wsService.connect(token as string);
                })
            ),
        {dispatch: false}
    );

    /**
     * Gère la déconnexion du WebSocket dès que l'utilisateur n'est plus authentifié.
     */
    disconnectWs$ = createEffect(() =>
            this.store.select(selectIsAuthenticated).pipe(
                filter(authenticated => !authenticated),
                tap(() => {
                    console.log('[NotificationEffects] Déconnexion du WS...');
                    this.wsService.disconnect();
                })
            ),
        {dispatch: false}
    );
}