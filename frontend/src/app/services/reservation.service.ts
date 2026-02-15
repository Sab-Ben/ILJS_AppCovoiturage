import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateReservationRequest {
  rideId: number;
  seats: number;
  desiredRoute: string; // ✅ requis
}

export type ReservationStatus = 'RESERVED' | 'COMPLETED' | 'CANCELLED';

export interface ReservationDto {
  id: number;
  seats: number;
  status: ReservationStatus;
  createdAt?: string;

  ride: {
    id: number;
    from: string;
    to: string;
    date: string;
    departureTime?: string;
    availableSeats?: number;
    price?: number;
    driverName?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly apiUrl = `${environment.apiUrl}/reservations`; // -> /api/v1/reservations

  constructor(private http: HttpClient) {}

  createReservation(payload: CreateReservationRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, payload);
  }

  // ✅ AJOUT : récupérer "mes réservations" (réservées / effectuées / annulées)
  getMyReservations(status: ReservationStatus): Observable<ReservationDto[]> {
    const params = new HttpParams().set('status', status);
    return this.http.get<ReservationDto[]>(`${this.apiUrl}/me`, { params });
  }

  cancelReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
