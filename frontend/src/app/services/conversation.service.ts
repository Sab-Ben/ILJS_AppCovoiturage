// conversation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConversationModel } from '../models/conversation.model';
import { environment } from '../../environments/environment'; // On centralise l'URL

@Injectable({ providedIn: 'root' })
export class ConversationService {
  private readonly BASE_URL = `${environment.apiUrl}/conversations`;

  constructor(private http: HttpClient) {}

  getMyConversations(): Observable<ConversationModel[]> {
    return this.http.get<ConversationModel[]>(`${this.BASE_URL}/me`);
  }

  createOrGetConversation(trajetId: number, otherUserId: number): Observable<number> {
    const params = new HttpParams()
        .set('trajetId', trajetId.toString())
        .set('otherUserId', otherUserId.toString());

    return this.http.post<number>(this.BASE_URL, null, { params });
  }
}