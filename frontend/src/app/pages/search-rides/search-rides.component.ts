import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { GeocodingService } from '../../services/geocoding.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap, map, takeUntil } from 'rxjs';
import { Trajet } from '../../models/trajet.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import * as ReservationActions from '../../store/reservation/reservation.actions';

@Component({
  selector: 'app-search-rides',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './search-rides.component.html',
  styleUrls: ['./search-rides.component.scss']
})
export class SearchRidesComponent implements OnInit, OnDestroy {
  departure = '';
  destination = '';
  date = '';
  results: Trajet[] = [];
  filteredResults: Trajet[] = [];
  isSearching = false;
  hasSearched = false;
  reservationEnCours: number | null = null;
  reservationMessage: { trajetId: number; text: string; success: boolean } | null = null;

  suggestionsDepart: { label: string; display_name: string }[] = [];
  suggestionsArrivee: { label: string; display_name: string }[] = [];

  private searchDepart$ = new Subject<string>();
  private searchArrivee$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private geocodingService: GeocodingService,
    private store: Store,
    private actions$: Actions,
    private translateService: TranslateService
  ) {
    this.actions$.pipe(
      ofType(ReservationActions.reserveRideSuccess),
      takeUntil(this.destroy$)
    ).subscribe(({ reservation }) => {
      const trajetId = reservation.ride.id;
      this.reservationEnCours = null;
      this.reservationMessage = {
        trajetId,
        text: this.translateService.instant('RIDES.RESERVATION_CONFIRMED'),
        success: true
      };
      const trajet = this.filteredResults.find(t => t.id === trajetId);
      if (trajet) {
        trajet.placesDisponibles--;
      }
    });

    this.actions$.pipe(
      ofType(ReservationActions.reserveRideFailure),
      takeUntil(this.destroy$)
    ).subscribe(({ error }) => {
      this.reservationEnCours = null;
      this.reservationMessage = {
        trajetId: 0,
        text: error || this.translateService.instant('RIDES.SERVER_ERROR'),
        success: false
      };
    });
  }

  ngOnInit(): void {
    this.searchDepart$.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      switchMap(q => this.geocodingService.searchAddresses(q))
    ).subscribe(results => this.suggestionsDepart = results);

    this.searchArrivee$.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      switchMap(q => this.geocodingService.searchAddresses(q))
    ).subscribe(results => this.suggestionsArrivee = results);
  }

  onDepartInput(query: string): void {
    this.searchDepart$.next(query);
  }

  onArriveeInput(query: string): void {
    this.searchArrivee$.next(query);
  }

  selectDepart(address: { label: string }): void {
    this.departure = address.label;
    this.suggestionsDepart = [];
  }

  selectArrivee(address: { label: string }): void {
    this.destination = address.label;
    this.suggestionsArrivee = [];
  }

  clearSuggestions(): void {
    setTimeout(() => {
      this.suggestionsDepart = [];
      this.suggestionsArrivee = [];
    }, 200);
  }

  search(): void {
    if (!this.departure && !this.destination) return;

    this.isSearching = true;
    this.hasSearched = true;

    const from = this.departure.split(',')[0].trim() || '';
    const to = this.destination.split(',')[0].trim() || '';

    const params: Record<string, string> = { from, to };
    if (this.date) {
      params['date'] = this.date;
    }

    this.http.get<Trajet[]>(`${environment.apiUrl}/trajets/search`, {
      params
    }).subscribe({
      next: (trajets) => {
        this.results = trajets;
        this.filteredResults = trajets.filter(t => t.placesDisponibles > 0);
        this.isSearching = false;
      },
      error: () => {
        this.results = [];
        this.filteredResults = [];
        this.isSearching = false;
      }
    });
  }

  reserver(trajetId: number): void {
    this.reservationEnCours = trajetId;
    this.reservationMessage = null;
    this.store.dispatch(ReservationActions.reserveRide({ rideId: trajetId }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
