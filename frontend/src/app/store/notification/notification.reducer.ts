import { createReducer, on } from '@ngrx/store';
import * as NotificationActions from './notification.actions';
import { NotificationModel } from '../../models/notification.model';

export interface NotificationState {
  notifications: NotificationModel[];
  unreadCount: number;
  loading: boolean;
  error: any;
}

export const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

export const notificationReducer = createReducer(
  initialState,

  on(NotificationActions.loadNotifications, (state) => ({ ...state, loading: true, error: null })),
  on(NotificationActions.loadNotificationsSuccess, (state, { notifications }) => ({
    ...state,
    loading: false,
    notifications,
  })),
  on(NotificationActions.loadNotificationsFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(NotificationActions.loadUnreadCountSuccess, (state, { count }) => ({ ...state, unreadCount: count })),
  on(NotificationActions.loadUnreadCountFailure, (state, { error }) => ({ ...state, error })),

  on(NotificationActions.markNotificationAsReadSuccess, (state, { notification }) => ({
    ...state,
    notifications: state.notifications.map((n) => (n.id === notification.id ? notification : n)),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),

  on(NotificationActions.markAllNotificationsAsReadSuccess, (state) => ({
    ...state,
    notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    unreadCount: 0,
  })),

  on(NotificationActions.notificationReceivedRealtime, (state, { notification }) => {
    const already = state.notifications.some((n) => n.id === notification.id);
    return {
      ...state,
      notifications: already ? state.notifications : [notification, ...state.notifications],
      unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
    };
  })
);
