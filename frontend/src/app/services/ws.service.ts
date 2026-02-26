import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AuthService } from './auth.service';
import { WsEvent } from '../models/ws-event.model';
import { Message } from '../models/message.model';
import { AppNotification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class WsService {
  private client: Client | null = null;
  private connected = false;

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  connect(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.client?.active || this.connected) return;

    const token = this.authService.getToken?.() ?? null;

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 3000,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      onConnect: () => {
        this.connected = true;
        console.log('[WS] connecté');
      },
      onStompError: (frame) => {
        console.error('[WS] erreur STOMP', frame.headers['message'], frame.body);
      },
      onWebSocketClose: () => {
        this.connected = false;
        console.warn('[WS] connexion fermée');
      }
    });

    this.client.activate();
  }

  disconnect(): void {
    this.client?.deactivate();
    this.connected = false;
  }

  subscribeToConversation(
    conversationId: number,
    callback: (event: WsEvent<Message>) => void
  ): StompSubscription | null {
    if (!this.client || !this.connected) return null;

    return this.client.subscribe(`/topic/conversations/${conversationId}`, (msg: IMessage) => {
      callback(JSON.parse(msg.body));
    });
  }

  subscribeToUserNotifications(
    userId: number,
    callback: (event: WsEvent<AppNotification>) => void
  ): StompSubscription | null {
    if (!this.client || !this.connected) return null;

    return this.client.subscribe(`/topic/users/${userId}/notifications`, (msg: IMessage) => {
      callback(JSON.parse(msg.body));
    });
  }

  isConnected(): boolean {
    return this.connected;
  }
}
