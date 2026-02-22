import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import * as MessageActions from './message.actions';
import { MessageService } from '../../services/message.service';

@Injectable()
export class MessageEffects {
  private actions$ = inject(Actions);
  private messageService = inject(MessageService);

  loadMessages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MessageActions.loadMessages),
      mergeMap(({ conversationId }) =>
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
        this.messageService.sendMessage(conversationId, { content }).pipe(
          // le message arrivera aussi en WS; on garde l'action success pour UX loading
          map((message) => MessageActions.sendMessageSuccess({ message })),
          catchError((error) => of(MessageActions.sendMessageFailure({ error })))
        )
      )
    )
  );
}
