import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NotificationState } from './notification.reducer';

export const selectNotificationState =
  createFeatureSelector<NotificationState>('notification');

export const selectNotifications = createSelector(
  selectNotificationState,
  (state) => state.notifications
);

export const selectUnreadNotificationCount = createSelector(
  selectNotificationState,
  (state) => state.unreadCount
);

export const selectNotificationsLoading = createSelector(
  selectNotificationState,
  (state) => state.loading
);
