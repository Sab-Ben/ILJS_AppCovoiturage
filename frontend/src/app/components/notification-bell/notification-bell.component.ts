import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectUnreadCount } from '../../store/notification/notification.selectors';
import * as NotificationActions from '../../store/notification/notification.actions';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss'],
})
export class NotificationBellComponent implements OnInit {
  unreadCount$!: Observable<number>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.unreadCount$ = this.store.select(selectUnreadCount);
    this.store.dispatch(NotificationActions.loadUnreadCount());
  }

  refresh(): void {
    this.store.dispatch(NotificationActions.loadUnreadCount());
  }
}
