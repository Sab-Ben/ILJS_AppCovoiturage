import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Message, SendMessageRequest } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private apiUrl = `${environment.apiUrl}/conversations`;

  constructor(private http: HttpClient) {}

  getMessages(conversationId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/${conversationId}/messages`);
  }

  sendMessage(conversationId: number, payload: SendMessageRequest): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/${conversationId}/messages`, payload);
  }
}
