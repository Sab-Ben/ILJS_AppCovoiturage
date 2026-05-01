import { createReducer, on } from '@ngrx/store';
import * as NotificationActions from './notification.actions';
import { AppNotification } from '../../models/notification.model';

export interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: any;
}

export const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null
};

export const notificationReducer = createReducer(
  initialState,

  on(NotificationActions.loadNotifications, NotificationActions.loadUnreadCount, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(NotificationActions.loadNotificationsSuccess, (state, { notifications }) => ({
    ...state,
    notifications,
    loading: false,
    error: null
  })),

  on(NotificationActions.loadUnreadCountSuccess, (state, { count }) => ({
    ...state,
    unreadCount: count,
    loading: false,
    error: null
  })),

  on(NotificationActions.notificationReceivedRealtime, (state, { notification }) => ({
    ...state,
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + 1
  })),

  on(NotificationActions.markNotificationAsReadSuccess, (state, { notification }) => {
    const updated = state.notifications.map((n) =>
      n.id === notification.id ? notification : n
    );

    const wasUnread = state.notifications.find(n => n.id === notification.id && !n.isRead);
    return {
      ...state,
      notifications: updated,
      unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
    };
  }),

  on(NotificationActions.markAllNotificationsAsReadSuccess, (state) => ({
    ...state,
    notifications: state.notifications.map(n => ({ ...n, isRead: true })),
    unreadCount: 0
  })),

  on(
    NotificationActions.loadNotificationsFailure,
    NotificationActions.loadUnreadCountFailure,
    NotificationActions.markNotificationAsReadFailure,
    NotificationActions.markAllNotificationsAsReadFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error
    })
  )
);
