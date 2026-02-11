import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReservationService {

  private apiUrl = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  reserver(trajetId: number, nbPlaces: number): Observable<any> {
    return this.http.post(this.apiUrl, { trajetId, nbPlaces });
  }
}
