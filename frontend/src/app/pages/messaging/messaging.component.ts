import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { StompSubscription } from '@stomp/stompjs';
import { Subscription } from 'rxjs';

import { Conversation } from '../../models/conversation.model';
import { Message } from '../../models/message.model';
import { WsEvent } from '../../models/ws-event.model';

import { ConversationService } from '../../services/conversation.service';
import { WsService } from '../../services/ws.service';
import { UserService } from '../../services/user.service';

import * as MessageActions from '../../store/message/message.actions';
import * as MessageSelectors from '../../store/message/message.selectors';
import * as NotificationActions from '../../store/notification/notification.actions';

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messaging.component.html'
})
export class MessagingComponent implements OnInit, OnDestroy {
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  messageInput = '';
  currentUserId: number | null = null;

  private sub = new Subscription();
  private conversationWsSub: StompSubscription | null = null;
  private notifWsSub: StompSubscription | null = null;

  constructor(
    private conversationService: ConversationService,
    private wsService: WsService,
    private userService: UserService,
    private route: ActivatedRoute,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.wsService.connect();

    this.sub.add(
      this.userService.getMyProfile().subscribe({
        next: (user) => {
          this.currentUserId = user.id;
          this.subscribeToNotifications(user.id);
        }
      })
    );

    this.loadConversations();

    this.sub.add(
      this.store.select(MessageSelectors.selectMessagesForActiveConversation).subscribe((msgs) => {
        this.messages = msgs;
      })
    );

    this.sub.add(
      this.route.queryParamMap.subscribe((params) => {
        const conversationId = Number(params.get('conversationId'));
        if (conversationId) {
          // Si les conversations sont déjà chargées, on sélectionne
          const found = this.conversations.find(c => c.id === conversationId);
          if (found) this.selectConversation(found);
        }
      })
    );
  }

  loadConversations(): void {
    this.conversationService.getMyConversations().subscribe({
      next: (conversations) => {
        this.conversations = conversations;

        const queryId = Number(this.route.snapshot.queryParamMap.get('conversationId'));
        if (queryId) {
          const found = conversations.find(c => c.id === queryId);
          if (found) {
            this.selectConversation(found);
            return;
          }
        }

        if (!this.selectedConversation && conversations.length > 0) {
          this.selectConversation(conversations[0]);
        }
      },
      error: (err) => console.error('Erreur chargement conversations', err)
    });
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;

    this.store.dispatch(MessageActions.setActiveConversation({ conversationId: conversation.id }));
    this.store.dispatch(MessageActions.loadMessages({ conversationId: conversation.id }));

    // Re-subscribe au topic de la conversation
    this.conversationWsSub?.unsubscribe();
    this.conversationWsSub = this.wsService.subscribeToConversation(
      conversation.id,
      (event: WsEvent<Message>) => {
        if (event.type === 'MESSAGE_CREATED') {
          this.store.dispatch(MessageActions.messageReceivedRealtime({ message: event.payload }));
        }
      }
    );
  }

  sendMessage(): void {
    if (!this.selectedConversation) return;
    const content = this.messageInput.trim();
    if (!content) return;

    this.store.dispatch(
      MessageActions.sendMessage({
        conversationId: this.selectedConversation.id,
        content
      })
    );

    this.messageInput = '';
  }

  private subscribeToNotifications(userId: number): void {
    this.notifWsSub?.unsubscribe();
    // this.notifWsSub = this.wsService.subscribeToUserNotifications(userId, (event) => {
    //   if (event.type === 'NOTIFICATION_CREATED') {
    //     this.store.dispatch(NotificationActions.notificationReceivedRealtime({ notification: event.payload }));
    //   }
    // });
  }

  isMine(message: Message): boolean {
    return !!this.currentUserId && message.senderId === this.currentUserId;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.conversationWsSub?.unsubscribe();
    this.notifWsSub?.unsubscribe();
  }
}
