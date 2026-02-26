// message.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MessageModel } from '../models/message.model';
import { environment } from '../../environments/environment';

export interface SendMessageRequest {
  conversationId: number;
  content: string;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly API_URL = `${environment.apiUrl}/messages`;

  constructor(private http: HttpClient) {}

  getMessages(conversationId: number): Observable<MessageModel[]> {
    return this.http.get<MessageModel[]>(`${this.API_URL}/conversation/${conversationId}`);
  }

  sendMessage(req: SendMessageRequest): Observable<MessageModel> {
    return this.http.post<MessageModel>(this.API_URL, req);
  }

  markConversationAsRead(conversationId: number): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/conversation/${conversationId}/read`, {});
  }
}