import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Component, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
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
import { UtcDatePipe } from '../../pipes/utc-date.pipe';

@Component({
  selector: 'app-messaging',
  standalone: true,
  imports: [CommonModule, FormsModule, UtcDatePipe, TranslateModule],
  templateUrl: './messaging.component.html',
  styleUrls: ['./messaging.component.scss']
})
export class MessagingComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  messageInput = '';
  currentUserId: number | null = null;
  currentUserEmail = '';
  loadingConversations = true;
  showChatOnMobile = false;

  private shouldScrollToBottom = false;
  private previousMessageCount = 0;
  private sub = new Subscription();
  private conversationWsSub: StompSubscription | null = null;

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
          this.currentUserEmail = user.email;
          this.loadConversations();
        }
      })
    );

    this.sub.add(
      this.store.select(MessageSelectors.selectMessagesForActiveConversation).subscribe((msgs) => {
        if (msgs.length > this.previousMessageCount) {
          this.shouldScrollToBottom = true;
        }
        this.previousMessageCount = msgs.length;
        this.messages = msgs;
      })
    );
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  loadConversations(): void {
    this.loadingConversations = true;
    this.conversationService.getMyConversations().subscribe({
      next: (conversations) => {
        this.conversations = conversations;
        this.loadingConversations = false;
        this.handleQueryParams(conversations);
      },
      error: () => {
        this.loadingConversations = false;
      }
    });
  }

  selectConversation(conversation: Conversation): void {
    if (this.selectedConversation?.id === conversation.id) {
      this.showChatOnMobile = true;
      return;
    }

    this.selectedConversation = conversation;
    this.showChatOnMobile = true;
    this.shouldScrollToBottom = true;

    this.store.dispatch(MessageActions.setActiveConversation({ conversationId: conversation.id }));
    this.store.dispatch(MessageActions.loadMessages({ conversationId: conversation.id }));

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
    this.shouldScrollToBottom = true;
  }

  isMine(message: Message): boolean {
    return !!this.currentUserId && message.senderId === this.currentUserId;
  }

  getOtherParticipant(conversation: Conversation): string {
    if (!this.currentUserEmail) return '';
    if (conversation.conducteurEmail === this.currentUserEmail) {
      return conversation.passagerEmail;
    }
    return conversation.conducteurEmail;
  }

  backToConversationList(): void {
    this.showChatOnMobile = false;
  }

  getInitials(email: string): string {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.conversationWsSub?.unsubscribe();
    this.store.dispatch(MessageActions.clearMessages());
  }

  private handleQueryParams(conversations: Conversation[]): void {
    const trajetId = Number(this.route.snapshot.queryParamMap.get('trajetId'));
    const conversationId = Number(this.route.snapshot.queryParamMap.get('conversationId'));

    if (trajetId) {
      this.openConversationByTrajet(trajetId, conversations);
      return;
    }

    if (conversationId) {
      const found = conversations.find(c => c.id === conversationId);
      if (found) {
        this.selectConversation(found);
        return;
      }
    }

    if (conversations.length > 0) {
      this.selectConversation(conversations[0]);
    }
  }

  private openConversationByTrajet(trajetId: number, existingConversations: Conversation[]): void {
    const existing = existingConversations.find(c => c.trajetId === trajetId);
    if (existing) {
      this.selectConversation(existing);
      return;
    }

    this.conversationService.openConversation(trajetId).subscribe({
      next: (conversation) => {
        if (!this.conversations.some(c => c.id === conversation.id)) {
          this.conversations = [conversation, ...this.conversations];
        }
        this.selectConversation(conversation);
      },
      error: () => {
        if (existingConversations.length > 0) {
          this.selectConversation(existingConversations[0]);
        }
      }
    });
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    } catch (_) {}
  }
}
