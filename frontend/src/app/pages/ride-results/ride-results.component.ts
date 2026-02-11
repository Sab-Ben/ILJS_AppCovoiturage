import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { RideService } from '../../services/ride.service';
import { Ride } from '../../models/ride.model';
import { of } from 'rxjs';

@Component({
  selector: 'app-ride-results',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ride-results.component.html',
  styleUrls: ['./ride-results.component.scss'],
})
export class RideResultsComponent implements OnInit, OnDestroy {
  rides: Ride[] = [];
  loading = false;
  errorMsg: string | null = null;

  // pour afficher les critères dans le template
  from = '';
  to = '';
  date = '';
  seats: number = 1; // ✅ AJOUTE CETTE LIGNE

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private rideService: RideService
  ) {}

  ngOnInit(): void {
    // À chaque changement de query params, on relance la recherche
    this.route.queryParamMap
      .pipe(
        takeUntil(this.destroy$),
        switchMap((params) => {
          this.from = (params.get('from') ?? '').trim();
          this.to = (params.get('to') ?? '').trim();
          this.date = (params.get('date') ?? '').trim();

          // sécurité: si critères manquants, on n'appelle pas l'API
          if (!this.from || !this.to || !this.date) {
            this.rides = [];
            this.errorMsg = 'Paramètres manquants (from, to, date).';
            return of([] as Ride[]);
          }


          this.loading = true;
          this.errorMsg = null;

          return this.rideService.searchRides(this.from, this.to, this.date);
        })
      )
      // switchMap attend un Observable : si on retourne [] au-dessus ça casse.
      // Donc on gère proprement en remplaçant le return [] par un observable.
      .subscribe({
        next: (rides: any) => {
          // Si le code au-dessus a mis un message d'erreur sans appel API,
          // rides peut être undefined -> on sécurise.
          this.rides = Array.isArray(rides) ? rides : [];
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.rides = [];
          this.errorMsg =
            err?.error?.message ??
            err?.message ??
            'Erreur lors de la récupération des trajets.';
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByRideId(_: number, ride: Ride): string | number {
    return ride.id ?? `${ride.from}-${ride.to}-${ride.date}-${ride.departureTime ?? ''}`;
  }

  // future action (réserver / demander) : ici tu pourras vérifier le token
  book(ride: Ride): void {
    console.log('TODO: réserver / demander', ride);
  }
}
