import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class WsService {
  private client: Client | null = null;
  private connected = false;

  // callbacks à exécuter dès que la connexion est prête
  private onConnectCallbacks: Array<() => void> = [];

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

        // flush callbacks en attente
        const pending = [...this.onConnectCallbacks];
        this.onConnectCallbacks = [];
        pending.forEach((cb) => {
          try {
            cb();
          } catch (e) {
            console.error('[WS] erreur callback onConnect', e);
          }
        });
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

  private runWhenConnected(cb: () => void): void {
    if (this.client && this.connected) {
      cb();
      return;
    }

    // lance la connexion si besoin
    this.connect();
    this.onConnectCallbacks.push(cb);
  }

  subscribeToConversation(
    conversationId: number,
    callback: (event: any) => void
  ): StompSubscription | null {
    let subscription: StompSubscription | null = null;

    this.runWhenConnected(() => {
      if (!this.client) return;
      subscription = this.client.subscribe(
        `/topic/conversations/${conversationId}`,
        (msg: IMessage) => callback(JSON.parse(msg.body))
      );
    });

    return subscription;
  }

  subscribeToUserNotifications(
    userId: number,
    callback: (event: any) => void
  ): StompSubscription | null {
    let subscription: StompSubscription | null = null;

    this.runWhenConnected(() => {
      if (!this.client) return;
      subscription = this.client.subscribe(
        `/topic/users/${userId}/notifications`,
        (msg: IMessage) => callback(JSON.parse(msg.body))
      );
    });

    return subscription;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
