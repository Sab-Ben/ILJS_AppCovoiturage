import { describe, it, expect } from 'vitest';
import {
  notificationReducer,
  initialState,
  NotificationState
} from './notification.reducer';
import * as NotificationActions from './notification.actions';
import { AppNotification } from '../../models/notification.model';

describe('notificationReducer', () => {
  const unreadNotif: AppNotification = {
    id: 1,
    type: 'MESSAGE_RECEIVED',
    title: 'Nouveau message',
    content: 'Vous avez un message',
    isRead: false,
    createdAt: '2026-02-22T10:00:00',
    referenceType: 'CONVERSATION',
    referenceId: 12
  };

  const readNotif: AppNotification = {
    id: 2,
    type: 'TRAJET_DELETED',
    title: 'Trajet supprimé',
    content: 'Trajet supprimé',
    isRead: true,
    createdAt: '2026-02-22T09:00:00',
    referenceType: 'TRAJET',
    referenceId: 4
  };

  it('should return initial state', () => {
    const state = notificationReducer(undefined, { type: 'Unknown' } as any);
    expect(state).toEqual(initialState);
  });

  it('should load notifications success', () => {
    const state = notificationReducer(
      { ...initialState, loading: true },
      NotificationActions.loadNotificationsSuccess({ notifications: [unreadNotif, readNotif] })
    );

    expect(state.loading).toBe(false);
    expect(state.notifications).toHaveLength(2);
  });

  it('should set unread count', () => {
    const state = notificationReducer(
      initialState,
      NotificationActions.loadUnreadCountSuccess({ count: 3 })
    );

    expect(state.unreadCount).toBe(3);
  });

  it('should prepend realtime notification and increment count', () => {
    const base: NotificationState = {
      ...initialState,
      notifications: [readNotif],
      unreadCount: 0
    };

    const state = notificationReducer(
      base,
      NotificationActions.notificationReceivedRealtime({ notification: unreadNotif })
    );

    expect(state.notifications[0].id).toBe(1);
    expect(state.unreadCount).toBe(1);
  });

  it('should mark one notification as read and decrement count', () => {
    const base: NotificationState = {
      ...initialState,
      notifications: [unreadNotif, readNotif],
      unreadCount: 1
    };

    const state = notificationReducer(
      base,
      NotificationActions.markNotificationAsReadSuccess({
        notification: { ...unreadNotif, isRead: true }
      })
    );

    expect(state.notifications.find(n => n.id === 1)?.isRead).toBe(true);
    expect(state.unreadCount).toBe(0);
  });

  it('should mark all as read', () => {
    const base: NotificationState = {
      ...initialState,
      notifications: [unreadNotif, readNotif],
      unreadCount: 1
    };

    const state = notificationReducer(
      base,
      NotificationActions.markAllNotificationsAsReadSuccess()
    );

    expect(state.notifications.every(n => n.isRead)).toBe(true);
    expect(state.unreadCount).toBe(0);
  });
});
