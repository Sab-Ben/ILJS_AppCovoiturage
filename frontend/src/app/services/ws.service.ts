import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AuthService } from './auth.service';
import { WsEvent } from '../models/ws-event.model';
import { Message } from '../models/message.model';
import { AppNotification } from '../models/notification.model';

interface PendingSubscription {
  topic: string;
  callback: (msg: IMessage) => void;
}

@Injectable({ providedIn: 'root' })
export class WsService {
  private client: Client | null = null;
  private connected = false;
  private pendingSubscriptions: PendingSubscription[] = [];

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
        this.flushPendingSubscriptions();
      },
      onStompError: (frame) => {
        console.error('[WS] erreur STOMP', frame.headers['message'], frame.body);
      },
      onWebSocketClose: () => {
        this.connected = false;
      }
    });

    this.client.activate();
  }

  disconnect(): void {
    this.pendingSubscriptions = [];
    this.client?.deactivate();
    this.connected = false;
  }

  subscribeToConversation(
    conversationId: number,
    callback: (event: WsEvent<Message>) => void
  ): StompSubscription | null {
    const topic = `/topic/conversations/${conversationId}`;
    return this.doSubscribe(topic, (msg: IMessage) => {
      callback(JSON.parse(msg.body));
    });
  }

  subscribeToUserNotifications(
    userId: number,
    callback: (event: WsEvent<AppNotification>) => void
  ): StompSubscription | null {
    const topic = `/topic/users/${userId}/notifications`;
    return this.doSubscribe(topic, (msg: IMessage) => {
      callback(JSON.parse(msg.body));
    });
  }

  subscribeToRideUpdates(
    trajetId: number,
    callback: (event: WsEvent<{ trajetId: number; availableSeats: number }>) => void
  ): StompSubscription | null {
    const topic = `/topic/rides/${trajetId}`;
    return this.doSubscribe(topic, (msg: IMessage) => {
      callback(JSON.parse(msg.body));
    });
  }

  isConnected(): boolean {
    return this.connected;
  }

  private doSubscribe(topic: string, callback: (msg: IMessage) => void): StompSubscription | null {
    if (this.client && this.connected) {
      return this.client.subscribe(topic, callback);
    }

    this.pendingSubscriptions.push({ topic, callback });
    return null;
  }

  private flushPendingSubscriptions(): void {
    if (!this.client || !this.connected) return;

    const pending = [...this.pendingSubscriptions];
    this.pendingSubscriptions = [];

    pending.forEach(({ topic, callback }) => {
      this.client!.subscribe(topic, callback);
    });
  }
}
