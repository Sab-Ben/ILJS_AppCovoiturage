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
        // abonnement par défaut (utile même si personne n'appelle subscribeToUserNotifications)
        this.userEventsSub = this.client?.subscribe('/user/queue/events', (msg) => {
          this.handleIncoming(msg);
        });
      },
    });

    this.client.activate();
  }

  disconnect() {
    this.userEventsSub?.unsubscribe();
    this.conversationSub?.unsubscribe();
    this.client?.deactivate();
  }

  /**
   * ✅ COMPAT:
   * - subscribeToUserNotifications(handler)
   * - subscribeToUserNotifications(anything, handler)
   *
   * On ignore le 1er param si 2 params sont fournis (souvent userId/email/token legacy).
   */
  subscribeToUserNotifications(
    a: any,
    b?: (event: WsEventModel) => void
  ): { unsubscribe: () => void } {
    const handler: ((event: WsEventModel) => void) | undefined =
      typeof a === 'function' ? a : b;

    if (!this.client?.active) this.connect();

    const sub = this.client?.subscribe('/user/queue/events', (msg: IMessage) => {
      const ev = this.parseEvent(msg);
      if (!ev) return;

      handler?.(ev);
      this.dispatchEvent(ev);
    });

    return { unsubscribe: () => sub?.unsubscribe() };
  }

  /**
   * COMPAT conversation topic
   */
  subscribeToConversation(
    conversationId: number,
    handler: (event: WsEventModel) => void
  ): { unsubscribe: () => void } {
    if (!this.client?.active) this.connect();

    const destination = `/topic/conversations/${conversationId}`;

    const sub = this.client?.subscribe(destination, (msg: IMessage) => {
      const ev = this.parseEvent(msg);
      if (!ev) return;

      handler(ev);
      this.dispatchEvent(ev);
    });

    this.conversationSub?.unsubscribe();
    this.conversationSub = sub;

    return { unsubscribe: () => sub?.unsubscribe() };
  }

  private handleIncoming(msg: IMessage) {
    const ev = this.parseEvent(msg);
    if (!ev) return;
    this.dispatchEvent(ev);
  }

  private dispatchEvent(ev: WsEventModel) {
    if (ev.type === 'NOTIFICATION') {
      this.store.dispatch(
        NotificationActions.notificationReceivedRealtime({ notification: ev.payload })
      );
      return;
    }

    if (ev.type === 'MESSAGE') {
      this.store.dispatch(MessageActions.messageReceivedRealtime({ message: ev.payload }));
      return;
    }
  }

  private parseEvent(msg: IMessage): WsEventModel | null {
    try {
      return JSON.parse(msg.body) as WsEventModel;
    } catch {
      return null;
    }
  }
}
