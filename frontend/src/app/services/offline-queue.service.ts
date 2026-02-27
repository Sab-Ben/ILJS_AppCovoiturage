// frontend/src/app/services/offline-queue.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OfflineQueueService {
  private readonly QUEUE_KEY = 'global_offline_queue';

  enqueueAction(action: any): void {
    const queue = this.getQueue();
    queue.push(action);
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    console.warn(`[Offline] Action mise en attente : ${action.type}`);
  }

  consumeQueue(): any[] {
    const queue = this.getQueue();
    localStorage.removeItem(this.QUEUE_KEY);
    return queue;
  }

  private getQueue(): any[] {
    const data = localStorage.getItem(this.QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  }
}