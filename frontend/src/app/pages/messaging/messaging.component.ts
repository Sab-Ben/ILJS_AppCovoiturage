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
  selectConversations
} from '../../store/message/message.selectors';

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

  private conversationWsSub?: { unsubscribe: () => void };
  private sub = new Subscription();

  constructor(private store: Store, private wsService: WsService) {}

  ngOnInit(): void {
    this.conversations$ = this.store.select(selectConversations);
    this.activeConversationId$ = this.store.select(selectActiveConversationId);
    this.messages$ = this.store.select(selectMessagesForActiveConversation);
    this.loading$ = this.store.select(selectMessageLoading);

    // Chargement initial des conversations
    this.store.dispatch(MessageActions.loadConversations());

    // Écoute du changement de conversation active
    this.sub.add(
        this.activeConversationId$.subscribe((id) => {
          if (!id) return;

          this.store.dispatch(MessageActions.loadMessages({ conversationId: id }));
          this.store.dispatch(MessageActions.markConversationAsRead({ conversationId: id }));

          // On se désabonne de l'ancien topic et on s'abonne au nouveau
          // Note : On ne passe plus de callback car le service gère le dispatch automatiquement
          this.conversationWsSub?.unsubscribe();
          this.conversationWsSub = this.wsService.subscribeToConversation(id);
        })
    );

    // Mise à jour de selectedConversation quand la liste change (pour les compteurs)
    this.sub.add(
        this.conversations$.subscribe((list) => {
          if (!this.selectedConversation || !list) return;

          // Sécurité : on vérifie que c et c.id existent pour éviter les crashs runtime
          const updated = list.find((c) => c?.id === this.selectedConversation?.id);
          if (updated) {
            this.selectedConversation = updated;
          }
        })
    );
  }

  selectConversation(c: ConversationModel) {
    if (!c) return;
    this.selectedConversation = c;

    // On dispatch les deux actions pour assurer la compatibilité
    this.store.dispatch(MessageActions.setActiveConversation({ conversationId: c.id }));
    this.store.dispatch(MessageActions.selectConversation({ conversationId: c.id }));
  }

  send() {
    const content = this.newMessage.trim();
    if (!content || !this.selectedConversation) return;

    this.store.dispatch(
        MessageActions.sendMessage({
          conversationId: this.selectedConversation.id,
          content
        })
    );

    this.newMessage = '';
  }

  trackByConversationId(_: number, c: ConversationModel) {
    return c?.id;
  }

  trackByMessageId(_: number, m: MessageModel) {
    return m?.id;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.conversationWsSub?.unsubscribe();
    // Plus de userWsSub ici car géré globalement ou par les Effects
  }
}