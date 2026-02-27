import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, tap, switchMap } from 'rxjs';
import * as MessageActions from './message.actions';
import { MessageService } from '../../services/message.service';
import { OfflineQueueService } from '../../services/offline-queue.service';

@Injectable()
export class MessageEffects {
    private actions$ = inject(Actions);
    private messageService = inject(MessageService);
    private offlineQueue = inject(OfflineQueueService);

    // LECTURE : Avec cache local par conversation
    loadMessages$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MessageActions.loadMessages),
            switchMap(({ conversationId }) =>
                this.messageService.getMessages(conversationId).pipe(
                    // On sauvegarde les messages de cette conversation en cache
                    tap((messages) => {
                        try {
                            localStorage.setItem(`cache_messages_${conversationId}`, JSON.stringify(messages));
                        } catch (e) {
                            console.error('Erreur cache messages', e);
                        }
                    }),
                    map((messages) => MessageActions.loadMessagesSuccess({ conversationId, messages })),
                    catchError((error) => {
                        // En cas d'erreur (offline), on tente de charger le cache spécifique
                        const cached = localStorage.getItem(`cache_messages_${conversationId}`);
                        if (cached) {
                            return of(MessageActions.loadMessagesSuccess({
                                conversationId,
                                messages: JSON.parse(cached)
                            }));
                        }
                        return of(MessageActions.loadMessagesFailure({ error }));
                    })
                )
            )
        )
    );

    // ENVOI : Avec file d'attente hors ligne
    sendMessage$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MessageActions.sendMessage),
            mergeMap((action) => {
                if (!navigator.onLine) {
                    this.offlineQueue.enqueueAction(action);
                    return of({ type: '[Message] Send Message Offline Queued' });
                }

                return this.messageService.sendMessage(action.conversationId, { content: action.content }).pipe(
                    map((message) => MessageActions.sendMessageSuccess({ message })),
                    catchError((error) => {
                        if (error.status === 0) {
                            this.offlineQueue.enqueueAction(action);
                            return of({ type: '[Message] Send Message Offline Queued' });
                        }
                        return of(MessageActions.sendMessageFailure({ error }));
                    })
                );
            })
        )
    );
}