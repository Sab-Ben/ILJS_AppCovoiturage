import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as MessageActions from '../../store/message/message.actions';
import { ConversationModel } from '../../models/conversation.model';
import { MessageModel } from '../../models/message.model';
import { WsService } from '../../services/ws.service';
import { Observable, Subscription } from 'rxjs';

import {
  selectActiveConversationId,
  selectMessagesForActiveConversation,
  selectMessageLoading,
} from '../../store/message/message.selectors';

import { selectConversations } from '../../store/message/message.selectors';

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss'],
})
export class MessagingComponent implements OnInit, OnDestroy {
  conversations$!: Observable<ConversationModel[]>;
  activeConversationId$!: Observable<number | null>;
  messages$!: Observable<MessageModel[]>;
  loading$!: Observable<boolean>;

  selectedConversation: ConversationModel | null = null;

  newMessage = '';

  //type simple "unsubscribe"
  private userWsSub?: { unsubscribe: () => void };
  private conversationWsSub?: { unsubscribe: () => void };

  private sub = new Subscription();

  constructor(private store: Store, private wsService: WsService) {}

  ngOnInit(): void {
    this.conversations$ = this.store.select(selectConversations);
    this.activeConversationId$ = this.store.select(selectActiveConversationId);
    this.messages$ = this.store.select(selectMessagesForActiveConversation);
    this.loading$ = this.store.select(selectMessageLoading);

    // load initial data
    this.store.dispatch(MessageActions.loadConversations());

    // WS: subscribe user events (message + notif) - handler optionnel
    this.userWsSub = this.wsService.subscribeToUserNotifications(() => {});

    // quand l’activeConversationId change, on charge messages + subscribe topic (compat)
    this.sub.add(
      this.activeConversationId$.subscribe((id) => {
        if (!id) return;
        this.store.dispatch(MessageActions.loadMessages({ conversationId: id }));
        this.store.dispatch(MessageActions.markConversationAsRead({ conversationId: id }));

        this.conversationWsSub?.unsubscribe();
        this.conversationWsSub = this.wsService.subscribeToConversation(id, () => {});
      })
    );

    // quand la liste des conversations change, on met à jour selectedConversation si besoin
    this.sub.add(
      this.conversations$.subscribe((list) => {
        if (!this.selectedConversation) return;
        const updated = list.find((c) => c.id === this.selectedConversation?.id);
        if (updated) this.selectedConversation = updated;
      })
    );
  }

  selectConversation(c: ConversationModel) {
    this.selectedConversation = c;
    // compat: ton code peut utiliser setActiveConversation
    this.store.dispatch(MessageActions.setActiveConversation({ conversationId: c.id }));
    // et aussi le nouveau nom (ça ne gêne pas)
    this.store.dispatch(MessageActions.selectConversation({ conversationId: c.id }));
  }

  send() {
    const content = this.newMessage.trim();
    if (!content || !this.selectedConversation) return;

    this.store.dispatch(
      MessageActions.sendMessage({ conversationId: this.selectedConversation.id, content })
    );

    this.newMessage = '';
  }

  trackByConversationId(_: number, c: ConversationModel) {
    return c.id;
  }

  trackByMessageId(_: number, m: MessageModel) {
    return m.id;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.userWsSub?.unsubscribe();
    this.conversationWsSub?.unsubscribe();
  }
}
