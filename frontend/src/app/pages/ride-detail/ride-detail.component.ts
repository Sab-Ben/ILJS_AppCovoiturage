import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { RideService } from '../../services/ride.service';
import { MapService } from '../../services/map.service';
import { Ride } from '../../models/ride.model';
import { ReservationService } from '../../services/reservation.service';


@Component({
  selector: 'app-ride-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ride-detail.component.html',
  styleUrls: ['./ride-detail.component.scss'],
})
export class RideDetailComponent implements OnInit, OnDestroy {
  ride: Ride | null = null;
  selectedSeats = 1;

  loading = false;
  errorMsg: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private rideService: RideService,
    private mapService: MapService,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    // places sélectionnées
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((qp) => {
        const seats = Number(qp.get('seats') ?? '1');
        this.selectedSeats = Number.isFinite(seats) && seats > 0 ? seats : 1;
      });

    // charger la ride par id
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

          // init map + draw route
          // ✅ on centre provisoirement sur le point de départ si dispo, sinon Paris
          const center =
            ride.fromLat != null && ride.fromLng != null
              ? ([ride.fromLat, ride.fromLng] as [number, number])
              : ([48.8566, 2.3522] as [number, number]);

          // IMPORTANT: initMap doit être appelé après que le div #map existe
          setTimeout(async () => {
            try {
              this.mapService.initMap('ride-map', center, 12);

              if (
                ride.fromLat != null && ride.fromLng != null &&
                ride.toLat != null && ride.toLng != null
              ) {
                await this.mapService.drawRoute(ride.fromLat, ride.fromLng, ride.toLat, ride.toLng);
              } else {
                // Fallback si pas de coords
                this.errorMsg = 'Coordonnées manquantes pour afficher l’itinéraire.';
              }
            } catch (e: any) {
              this.errorMsg = e?.message ?? 'Erreur affichage carte/itinéraire';
            }
          }, 0);
        },
        error: (err) => {
          this.loading = false;
          this.ride = null;
          this.errorMsg = err?.message ?? 'Erreur chargement course';
        },
      });
  }

  ngOnDestroy(): void {
    this.mapService.clearRoute();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
