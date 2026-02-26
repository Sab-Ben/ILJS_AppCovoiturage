import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Store } from '@ngrx/store';
import { WsEventModel } from '../models/ws-event.model';
import * as NotificationActions from '../store/notification/notification.actions';
import * as MessageActions from '../store/message/message.actions';

@Injectable({ providedIn: 'root' })
export class WsService {
  private client?: Client;
  private userEventsSub?: StompSubscription;
  private conversationSub?: StompSubscription;

  constructor(private store: Store) {}

  connect(token?: string) {
    if (this.client?.active) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 3000,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      onConnect: () => {
        this.subscribeToUserEvents();
      },
    });

    this.client.activate();
  }

  private subscribeToUserEvents() {
    if (this.userEventsSub) return;
    this.userEventsSub = this.client?.subscribe('/user/queue/events', (msg) => {
      this.handleIncoming(msg); // <--- On garde la méthode ici
    });
  }

  // On garde handleIncoming séparé pour le test
  private handleIncoming(msg: IMessage) {
    const ev = this.parseEvent(msg);
    if (ev) this.dispatchEvent(ev);
  }

  private dispatchEvent(ev: WsEventModel) {
    if (ev.type === 'NOTIFICATION') {
      this.store.dispatch(NotificationActions.notificationReceivedRealtime({ notification: ev.payload }));
    } else if (ev.type === 'MESSAGE') {
      this.store.dispatch(MessageActions.messageReceivedRealtime({ message: ev.payload }));
    }
  }

  private parseEvent(msg: IMessage): WsEventModel | null {
    try {
      return JSON.parse(msg.body) as WsEventModel;
    } catch {
      return null;
    }
  }

  disconnect() {
    this.userEventsSub?.unsubscribe();
    this.userEventsSub = undefined;
    this.conversationSub?.unsubscribe();
    this.client?.deactivate();
  }

  subscribeToConversation(conversationId: number): { unsubscribe: () => void } {
    if (!this.client?.active) this.connect();
    const destination = `/topic/conversations/${conversationId}`;
    this.conversationSub?.unsubscribe();
    const sub = this.client?.subscribe(destination, (msg: IMessage) => {
      this.handleIncoming(msg);
    });
    this.conversationSub = sub;
    return { unsubscribe: () => sub?.unsubscribe() };
  }
}