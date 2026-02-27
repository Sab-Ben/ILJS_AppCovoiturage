import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import * as NotificationActions from '../../store/notification/notification.actions';
import * as NotificationSelectors from '../../store/notification/notification.selectors';
import { AppNotification } from '../../models/notification.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss']
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifications: AppNotification[] = [];
  unreadCount = 0;
  open = false;
  private sub = new Subscription();

  constructor(
    private store: Store,
    private router: Router,
    private elementRef: ElementRef
  ) {}

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

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (this.open && !this.elementRef.nativeElement.contains(event.target)) {
      this.open = false;
    }
  }

  toggle(): void {
    this.open = !this.open;
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'POINTS_CREDITED': return 'coin-up';
      case 'POINTS_DEBITED': return 'coin-down';
      case 'LEVEL_UP': return 'star';
      case 'RESERVATION_CREATED': return 'bookmark';
      case 'RESERVATION_CONFIRMED': return 'check';
      case 'RESERVATION_CANCELLED': return 'cancel';
      case 'TRAJET_DELETED': return 'alert';
      case 'MESSAGE_RECEIVED': return 'message';
      default: return 'info';
    }
  }

  getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "à l'instant";
    if (diffMin < 60) return diffMin + ' min';
    if (diffHours < 24) return diffHours + 'h';
    if (diffDays < 7) return diffDays + 'j';
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  markAsRead(notification: AppNotification): void {
    if (!notification.isRead) {
      this.store.dispatch(NotificationActions.markNotificationAsRead({ id: notification.id }));
    }

    this.open = false;

    if (notification.referenceType === 'CONVERSATION' && notification.referenceId) {
      this.router.navigate(['/messaging'], { queryParams: { conversationId: notification.referenceId } });
    } else if (notification.referenceType === 'TRAJET' && notification.referenceId) {
      this.router.navigate(['/ride', notification.referenceId]);
    } else if (notification.referenceType === 'LEVEL') {
      this.router.navigate(['/dashboard']);
    }
  }

  markAllAsRead(): void {
    this.store.dispatch(NotificationActions.markAllNotificationsAsRead());
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
