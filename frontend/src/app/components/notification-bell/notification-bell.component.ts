import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import * as NotificationActions from '../../store/notification/notification.actions';
import * as NotificationSelectors from '../../store/notification/notification.selectors';
import { AppNotification } from '../../models/notification.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html'
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifications: AppNotification[] = [];
  unreadCount = 0;
  open = false;
  private sub = new Subscription();

  constructor(private store: Store, private router: Router) {}

  ngOnInit(): void {
    this.store.dispatch(NotificationActions.loadNotifications());
    this.store.dispatch(NotificationActions.loadUnreadCount());

    this.sub.add(
      this.store.select(NotificationSelectors.selectNotifications)
        .subscribe(v => this.notifications = v)
    );

    this.sub.add(
      this.store.select(NotificationSelectors.selectUnreadNotificationCount)
        .subscribe(v => this.unreadCount = v)
    );
  }

  toggle(): void {
    this.open = !this.open;
  }

  markAsRead(notification: AppNotification): void {
    if (!notification.isRead) {
      this.store.dispatch(NotificationActions.markNotificationAsRead({ id: notification.id }));
    }

    if (notification.referenceType === 'CONVERSATION' && notification.referenceId) {
      this.router.navigate(['/messaging'], { queryParams: { conversationId: notification.referenceId } });
      this.open = false;
      return;
    }

    if (notification.referenceType === 'TRAJET' && notification.referenceId) {
      this.router.navigate(['/mes-trajets']);
      this.open = false;
    }
  }

  markAllAsRead(): void {
    this.store.dispatch(NotificationActions.markAllNotificationsAsRead());
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
