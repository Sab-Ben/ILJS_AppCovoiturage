import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { GeocodingService } from '../../services/geocoding.service';
import { debounceTime, distinctUntilChanged, Subject, switchMap, map } from 'rxjs';
import { Trajet } from '../../models/trajet.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-search-rides',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './search-rides.component.html',
  styleUrls: ['./search-rides.component.scss']
})
export class SearchRidesComponent implements OnInit {
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

  constructor(
    private http: HttpClient,
    private geocodingService: GeocodingService
  ) {}

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

    this.http.post<unknown>(
      `${environment.apiUrl}/reservations/trajets/${trajetId}/reservations`, {}
    ).subscribe({
      next: () => {
        this.reservationEnCours = null;
        this.reservationMessage = { trajetId, text: 'Reservation confirmee !', success: true };
        const trajet = this.filteredResults.find(t => t.id === trajetId);
        if (trajet) {
          trajet.placesDisponibles--;
        }
      },
      error: (err) => {
        this.reservationEnCours = null;
        const message = err.error?.message || err.error || 'Erreur lors de la reservation';
        this.reservationMessage = { trajetId, text: message, success: false };
      }
    });
  }
}
