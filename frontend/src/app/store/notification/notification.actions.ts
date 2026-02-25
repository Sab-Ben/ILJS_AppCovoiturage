import { createAction, props } from '@ngrx/store';
import { NotificationModel } from '../../models/notification.model';

export const loadNotifications = createAction('[Notification] Load');
export const loadNotificationsSuccess = createAction(
  '[Notification] Load Success',
  props<{ notifications: NotificationModel[] }>()
);
export const loadNotificationsFailure = createAction(
  '[Notification] Load Failure',
  props<{ error: any }>()
);

export const loadUnreadCount = createAction('[Notification] Load Unread Count');
export const loadUnreadCountSuccess = createAction(
  '[Notification] Load Unread Count Success',
  props<{ count: number }>()
);
export const loadUnreadCountFailure = createAction(
  '[Notification] Load Unread Count Failure',
  props<{ error: any }>()
);

export const markNotificationAsRead = createAction(
  '[Notification] Mark As Read',
  props<{ id: number }>()
);
export const markNotificationAsReadSuccess = createAction(
  '[Notification] Mark As Read Success',
  props<{ notification: NotificationModel }>()
);
export const markNotificationAsReadFailure = createAction(
  '[Notification] Mark As Read Failure',
  props<{ error: any }>()
);

export const markAllNotificationsAsRead = createAction('[Notification] Mark All As Read');
export const markAllNotificationsAsReadSuccess = createAction('[Notification] Mark All As Read Success');
export const markAllNotificationsAsReadFailure = createAction(
  '[Notification] Mark All As Read Failure',
  props<{ error: any }>()
);

/**
 * Realtime (WebSocket) : une notif arrive côté client
 */
export const notificationReceivedRealtime = createAction(
  '[Notification] Realtime Received',
  props<{ notification: NotificationModel }>()
);
