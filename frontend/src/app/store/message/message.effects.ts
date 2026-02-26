import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import * as MessageActions from './message.actions';
import { ConversationService } from '../../services/conversation.service';
import { MessageService } from '../../services/message.service';

@Injectable()
export class MessageEffects {
    // Utilisation de inject() pour une initialisation propre et sécurisée
    private actions$ = inject(Actions);
    private conversationService = inject(ConversationService);
    private messageService = inject(MessageService);

    /**
     * Charge toutes les conversations de l'utilisateur.
     */
    loadConversations$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MessageActions.loadConversations),
            tap(() => console.log('[MessageEffects] Chargement des conversations...')),
            mergeMap(() =>
                this.conversationService.getMyConversations().pipe(
                    map((conversations) => MessageActions.loadConversationsSuccess({ conversations })),
                    catchError((error) => {
                        console.error('[MessageEffects] Erreur chargement conversations', error);
                        return of(MessageActions.loadConversationsFailure({ error }));
                    })
                )
            )
        )
    );

    /**
     * Charge les messages d'une conversation spécifique.
     * switchMap est utilisé ici pour annuler la requête précédente si l'utilisateur change de conversation rapidement.
     */
    loadMessages$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MessageActions.loadMessages),
            tap(({ conversationId }) => console.log(`[MessageEffects] Chargement des messages pour la conv: ${conversationId}`)),
            switchMap(({ conversationId }) =>
                this.messageService.getMessages(conversationId).pipe(
                    map((messages) => MessageActions.loadMessagesSuccess({ conversationId, messages })),
                    catchError((error) => {
                        console.error(`[MessageEffects] Erreur chargement messages (${conversationId})`, error);
                        return of(MessageActions.loadMessagesFailure({ error }));
                    })
                )
            )
        )
    );

    /**
     * Envoie un nouveau message dans une conversation.
     */
    sendMessage$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MessageActions.sendMessage),
            tap(({ conversationId }) => console.log(`[MessageEffects] Envoi d'un message pour la conv: ${conversationId}`)),
            mergeMap(({ conversationId, content }) =>
                this.messageService.sendMessage({ conversationId, content }).pipe(
                    map((message) => MessageActions.sendMessageSuccess({ message })),
                    catchError((error) => {
                        console.error('[MessageEffects] Erreur envoi message', error);
                        return of(MessageActions.sendMessageFailure({ error }));
                    })
                )
            )
        )
    );

    /**
     * Marque une conversation entière comme lue.
     */
    markAsRead$ = createEffect(() =>
        this.actions$.pipe(
            ofType(MessageActions.markConversationAsRead),
            mergeMap(({ conversationId }) =>
                this.messageService.markConversationAsRead(conversationId).pipe(
                    map(() => MessageActions.markConversationAsReadSuccess({ conversationId })),
                    catchError((error) => {
                        console.error(`[MessageEffects] Erreur marquage comme lu (${conversationId})`, error);
                        return of(MessageActions.markConversationAsReadFailure({ error }));
                    })
                )
            )
        )
    );
}