import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NotificationService } from './notification.service';
import { environment } from '../../environments/environment';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should get my notifications', () => {
    service.getMyNotifications().subscribe((res) => {
      expect(res.length).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/notifications/me`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, title: 'Notif' }]);
  });

  it('should get unread count', () => {
    service.getUnreadCount().subscribe((res) => {
      expect(res.count).toBe(3);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/notifications/me/unread-count`);
    expect(req.request.method).toBe('GET');
    req.flush({ count: 3 });
  });

  it('should mark notification as read', () => {
    service.markAsRead(7).subscribe((res) => {
      expect(res.id).toBe(7);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/notifications/7/read`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ id: 7, isRead: true });
  });

  it('should mark all notifications as read', () => {
    service.markAllAsRead().subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/notifications/me/read-all`);
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });
});
