import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConversationModel } from '../models/conversation.model';

const BASE_URL = 'http://localhost:8080/api/v1';

@Injectable({ providedIn: 'root' })
export class ConversationService {
  constructor(private http: HttpClient) {}

  getMyConversations(): Observable<ConversationModel[]> {
    return this.http.get<ConversationModel[]>(`${BASE_URL}/conversations/me`);
  }

  createOrGetConversation(trajetId: number, otherUserId: number): Observable<number> {
    const params = new HttpParams()
      .set('trajetId', trajetId)
      .set('otherUserId', otherUserId);

    return this.http.post<number>(`${BASE_URL}/conversations`, null, { params });
  }
}
