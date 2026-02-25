import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import {
  Reservation,
  ReservationStatus,
  CreateReservationRequest
} from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly apiUrl = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  createReservation(payload: CreateReservationRequest): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, payload);
  }

  getMyReservations(status: ReservationStatus): Observable<Reservation[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<Reservation[]>(`${this.apiUrl}/me`, { params });
  }

  cancelReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}