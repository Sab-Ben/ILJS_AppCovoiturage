import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NotificationModel, UnreadCountResponse } from '../models/notification.model';

const BASE_URL = 'http://localhost:8080/api/v1';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private http: HttpClient) {}

  getMyNotifications(): Observable<NotificationModel[]> {
    return this.http.get<NotificationModel[]>(`${BASE_URL}/notifications/me`);
  }

  markAsRead(id: number): Observable<NotificationModel> {
    return this.http.patch<NotificationModel>(`${BASE_URL}/notifications/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${BASE_URL}/notifications/me/read-all`, {});
  }

  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(`${BASE_URL}/notifications/me/unread-count`);
  }
}
