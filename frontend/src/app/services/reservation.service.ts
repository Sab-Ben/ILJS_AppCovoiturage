import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ReservationModel } from '../models/reservation.model';

const BASE_URL = 'http://localhost:8080/api/v1';

export interface CreateReservationPayload {
  // ton ancien code semble envoyer rideId (id trajet)
  rideId?: number;
  trajetId?: number; // au cas où
  seats?: number;
  desiredRoute?: string;
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  constructor(private http: HttpClient) {}

  /**
   * ✅ Nouvelle API (simple)
   * backend: POST /api/v1/trajets/{trajetId}/reservations
   */
  reserveTrajet(trajetId: number): Observable<any> {
    return this.http.post<any>(`${BASE_URL}/trajets/${trajetId}/reservations`, {});
  }

  /**
   * ✅ COMPAT (ancien front)
   * ride-detail / ride-results appellent createReservation(payload)
   * On convertit payload.rideId -> trajetId
   *
   * NB: le backend actuel ignore seats/desiredRoute (il met seats=1, route par défaut),
   * donc on ne les envoie pas ici.
   */
  createReservation(payload: CreateReservationPayload): Observable<any> {
    const trajetId = payload.trajetId ?? payload.rideId;
    if (!trajetId) {
      return throwError(() => new Error('trajetId/rideId manquant pour créer une réservation'));
    }
    return this.reserveTrajet(trajetId);
  }

  /**
   * backend: GET /api/v1/reservations/me
   */
  getMyReservations(): Observable<ReservationModel[]> {
    return this.http.get<ReservationModel[]>(`${BASE_URL}/reservations/me`);
  }

  /**
   * backend: GET /api/v1/trajets/{trajetId}/reservations
   */
  getReservationsByTrajet(trajetId: number): Observable<ReservationModel[]> {
    return this.http.get<ReservationModel[]>(`${BASE_URL}/trajets/${trajetId}/reservations`);
  }

  cancelReservation(reservationId: number): Observable<void> {
    return throwError(() => new Error("Annulation non disponible: endpoint backend manquant"));
  }
}
