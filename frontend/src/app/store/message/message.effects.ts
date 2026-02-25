import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as MessageActions from './message.actions';
import { ConversationService } from '../../services/conversation.service';
import { MessageService } from '../../services/message.service';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';

@Injectable()
export class MessageEffects {
  constructor(
    private actions$: Actions,
    private conversationService: ConversationService,
    private messageService: MessageService
  ) {}

  loadConversations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MessageActions.loadConversations),
      mergeMap(() =>
        this.conversationService.getMyConversations().pipe(
          map((conversations) => MessageActions.loadConversationsSuccess({ conversations })),
          catchError((error) => of(MessageActions.loadConversationsFailure({ error })))
        )
      )
    )
  );

  loadMessages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MessageActions.loadMessages),
      switchMap(({ conversationId }) =>
        this.messageService.getMessages(conversationId).pipe(
          map((messages) => MessageActions.loadMessagesSuccess({ conversationId, messages })),
          catchError((error) => of(MessageActions.loadMessagesFailure({ error })))
        )
      )
    )
  );

  sendMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MessageActions.sendMessage),
      mergeMap(({ conversationId, content }) =>
        this.messageService.sendMessage({ conversationId, content }).pipe(
          map((message) => MessageActions.sendMessageSuccess({ message })),
          catchError((error) => of(MessageActions.sendMessageFailure({ error })))
        )
      )
    )
  );

  markAsRead$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MessageActions.markConversationAsRead),
      mergeMap(({ conversationId }) =>
        this.messageService.markConversationAsRead(conversationId).pipe(
          map(() => MessageActions.markConversationAsReadSuccess({ conversationId })),
          catchError((error) => of(MessageActions.markConversationAsReadFailure({ error })))
        )
      )
    )
  );
}
