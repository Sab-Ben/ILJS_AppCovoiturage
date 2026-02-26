import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Conversation } from '../models/conversation.model';

@Injectable({ providedIn: 'root' })
export class ConversationService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  openConversation(trajetId: number): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/trajets/${trajetId}/conversations`, {});
  }

  getMyConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.apiUrl}/conversations/me`);
  }
}
