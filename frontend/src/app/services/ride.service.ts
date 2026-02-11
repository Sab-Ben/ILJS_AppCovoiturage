import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Ride } from '../models/ride.model';

@Injectable({ providedIn: 'root' })
export class RideService {
  private readonly baseUrl = environment.apiUrl;

  // ⚠️ adapte si besoin
  private readonly searchEndpoint = '/rides/search';
  private readonly rideByIdEndpoint = '/rides'; // -> GET /rides/:id

  constructor(private http: HttpClient) {}

  searchRides(from: string, to: string, date: string): Observable<Ride[]> {
    const params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('date', date);

    return this.http.get<Ride[]>(`${this.baseUrl}${this.searchEndpoint}`, { params });
  }

  getRideById(id: string | number): Observable<Ride> {
    return this.http.get<Ride>(`${this.baseUrl}${this.rideByIdEndpoint}/${id}`);
  }
}
