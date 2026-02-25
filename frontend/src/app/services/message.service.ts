import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MessageModel } from '../models/message.model';

const BASE_URL = 'http://localhost:8080/api/v1';

export interface SendMessageRequest {
  conversationId: number;
  content: string;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  constructor(private http: HttpClient) {}

  getMessages(conversationId: number): Observable<MessageModel[]> {
    return this.http.get<MessageModel[]>(`${BASE_URL}/messages/conversation/${conversationId}`);
  }

  sendMessage(req: SendMessageRequest): Observable<MessageModel> {
    return this.http.post<MessageModel>(`${BASE_URL}/messages`, req);
  }

  markConversationAsRead(conversationId: number): Observable<void> {
    return this.http.patch<void>(`${BASE_URL}/messages/conversation/${conversationId}/read`, {});
  }
}
