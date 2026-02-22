import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';

import { NotificationBellComponent } from './notification-bell.component';
import * as NotificationActions from '../../store/notification/notification.actions';
import { AppNotification } from '../../models/notification.model';

describe('NotificationBellComponent', () => {
  let component: NotificationBellComponent;
  let fixture: ComponentFixture<NotificationBellComponent>;

  const dispatchMock = vi.fn();

  const storeMock = {
    dispatch: dispatchMock,
    select: vi.fn((selector: any) => {
      // Retourne des valeurs simples pour les 2 selectors utilisés
      if (selector.name?.includes('selectNotifications')) {
        return of([]);
      }
      if (selector.name?.includes('selectUnreadNotificationCount')) {
        return of(0);
      }
      return of([]);
    })
  };

  beforeEach(async () => {
    dispatchMock.mockClear();

    await TestBed.configureTestingModule({
      imports: [NotificationBellComponent],
      providers: [
        provideRouter([]),
        { provide: Store, useValue: storeMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationBellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch load actions on init', () => {
    // ngOnInit déjà exécuté dans detectChanges()
    expect(dispatchMock).toHaveBeenCalledWith(NotificationActions.loadNotifications());
    expect(dispatchMock).toHaveBeenCalledWith(NotificationActions.loadUnreadCount());
  });

  it('toggle should open/close panel', () => {
    expect(component.open).toBe(false);
    component.toggle();
    expect(component.open).toBe(true);
    component.toggle();
    expect(component.open).toBe(false);
  });

  it('should dispatch markAsRead for unread notification', () => {
    const notif: AppNotification = {
      id: 1,
      type: 'MESSAGE_RECEIVED',
      title: 'Nouveau message',
      content: 'test',
      isRead: false,
      createdAt: '2026-02-22T10:00:00',
      referenceType: 'TRAJET',
      referenceId: 10
    };

    component.markAsRead(notif);

    expect(dispatchMock).toHaveBeenCalledWith(
      NotificationActions.markNotificationAsRead({ id: 1 })
    );
  });

  it('should not dispatch markAsRead for already read notification', () => {
    dispatchMock.mockClear();

    const notif: AppNotification = {
      id: 2,
      type: 'TRAJET_DELETED',
      title: 'Trajet supprimé',
      content: 'test',
      isRead: true,
      createdAt: '2026-02-22T10:00:00'
    };

    component.markAsRead(notif);

    expect(dispatchMock).not.toHaveBeenCalledWith(
      NotificationActions.markNotificationAsRead({ id: 2 })
    );
  });

  it('should dispatch markAllAsRead', () => {
    component.markAllAsRead();

    expect(dispatchMock).toHaveBeenCalledWith(
      NotificationActions.markAllNotificationsAsRead()
    );
  });
});
