import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, switchMap, takeUntil } from 'rxjs';

import { RideService } from '../../services/ride.service';
import { MapService } from '../../services/map.service';
import { Ride } from '../../models/ride.model';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-ride-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './ride-detail.component.html',
  styleUrls: ['./ride-detail.component.scss'],
})
export class RideDetailComponent implements OnInit, OnDestroy {
  ride: Ride | null = null;
  selectedSeats = 1;

  // champ saisi par l'utilisateur (obligatoire)
  desiredRoute = '';

  successMsg: string | null = null;

  // pour annuler ensuite
  lastReservationId: number | null = null;
  lastReservedSeats = 0;

  loading = false;
  errorMsg: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rideService: RideService,
    private mapService: MapService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    // seats depuis query params
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((qp) => {
        const seats = Number(qp.get('seats') ?? '1');
        this.selectedSeats = Number.isFinite(seats) && seats > 0 ? seats : 1;
      });

    // ride id depuis params
    this.loading = true;
    this.route.paramMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          const id = params.get('id');
          if (!id) throw new Error('ID course manquant');
          return this.rideService.getRideById(id);
        })
      )
      .subscribe({
        next: async (ride) => {
          this.ride = ride;
          this.loading = false;
          this.errorMsg = null;

          const center =
            (ride as any).fromLat != null && (ride as any).fromLng != null
              ? ([(ride as any).fromLat, (ride as any).fromLng] as [number, number])
              : ([48.8566, 2.3522] as [number, number]); // fallback Paris

          setTimeout(async () => {
            try {
              this.mapService.initMap('ride-map', center, 12);

              if (
                (ride as any).fromLat != null &&
                (ride as any).fromLng != null &&
                (ride as any).toLat != null &&
                (ride as any).toLng != null
              ) {
                await this.mapService.drawRoute(
                  (ride as any).fromLat,
                  (ride as any).fromLng,
                  (ride as any).toLat,
                  (ride as any).toLng
                );
              } else {
                this.errorMsg = 'Coordonnées manquantes pour afficher l’itinéraire.';
              }
            } catch (e: any) {
              this.errorMsg = e?.message ?? 'Erreur affichage carte/itinéraire';
            }
          }, 0);
        },
        error: (err: any) => {
          this.loading = false;
          this.ride = null;
          this.errorMsg = err?.message ?? 'Erreur chargement course';
        },
      });
  }

  reserve(): void {
    if (!this.ride) return;

    this.errorMsg = null;
    this.successMsg = null;

    if (!this.desiredRoute.trim()) {
      this.errorMsg = 'Veuillez indiquer le trajet souhaité.';
      return;
    }

    const availableSeats = Number((this.ride as any).availableSeats ?? 0);
    if (availableSeats && this.selectedSeats > availableSeats) {
      this.errorMsg = 'Pas assez de places disponibles.';
      return;
    }

    const payload = {
      rideId: Number((this.ride as any).id),
      seats: this.selectedSeats,
      // ✅ on envoie ce que l'utilisateur a saisi
      desiredRoute: this.desiredRoute.trim(),
    };

    if (!payload.rideId || Number.isNaN(payload.rideId)) {
      this.errorMsg = "Impossible de réserver : id du trajet invalide.";
      return;
    }

    this.loading = true;

    // ✅ UN SEUL appel HTTP (important)
    this.reservationService
      .createReservation(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.successMsg = 'Réservation confirmée ✅';

          // stocke l'id réservation pour annuler (si besoin)
          this.lastReservationId = res.id;
          this.lastReservedSeats = this.selectedSeats;

          // décrément visuel immédiat
          if (this.ride && (this.ride as any).availableSeats != null) {
            (this.ride as any).availableSeats =
              Number((this.ride as any).availableSeats) - this.selectedSeats;
          }

          // ✅ redirection vers "mes réservations"
          this.router.navigate(['/my-reservations']);
        },
        error: (err: any) => {
          this.loading = false;
          console.error(err);
          this.errorMsg =
            err?.error?.message ?? 'Impossible de réserver (erreur serveur)';
        },
      });
  }

  cancel(): void {
    if (!this.lastReservationId || !this.ride) return;

    if (!confirm('Annuler cette réservation ? (possible uniquement jusqu’à 2h avant)')) return;

    this.loading = true;
    this.errorMsg = null;
    this.successMsg = null;

    this.reservationService
      .cancelReservation(this.lastReservationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.successMsg = 'Réservation annulée ✅';

          // ré-incrémente visuel
          if (this.ride && (this.ride as any).availableSeats != null) {
            (this.ride as any).availableSeats =
              Number((this.ride as any).availableSeats) + this.lastReservedSeats;
          }

          this.lastReservationId = null;
          this.lastReservedSeats = 0;
        },
        error: (err: any) => {
          this.loading = false;
          console.error(err);
          this.errorMsg =
            err?.error?.message ?? 'Impossible d’annuler (moins de 2h avant le départ)';
        },
      });
  }

  ngOnDestroy(): void {
    this.mapService.clearRoute();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
