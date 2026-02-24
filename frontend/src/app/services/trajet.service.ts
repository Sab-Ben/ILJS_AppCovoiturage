import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Trajet } from '../models/trajet.model';
import { CompletedRide } from '../models/completed-ride.model';



@Injectable({
    providedIn: 'root'
})
export class TrajetService {
    private apiUrl = `${environment.apiUrl}/trajets`;

    constructor(private http: HttpClient) {}

    createTrajet(trajet: Trajet): Observable<Trajet> {
        return this.http.post<Trajet>(this.apiUrl, trajet);
    }

    getMyTrajets(): Observable<Trajet[]> {
        return this.http.get<Trajet[]>(`${this.apiUrl}/me`);
    }

    deleteTrajet(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }


    searchTrajets(from: string, to: string, date: string) {
      const params = new HttpParams()
        .set('from', (from ?? '').trim())
        .set('to', (to ?? '').trim())
        .set('date', date); // "2026-02-16"

      return this.http.get<Trajet[]>(`${environment.apiUrl}/trajets/search`, { params });
    }

    getCompletedTrajets(): Observable<CompletedRide[]> {
      return this.http.get<CompletedRide[]>(`${this.apiUrl}/completed`);
    }


}
