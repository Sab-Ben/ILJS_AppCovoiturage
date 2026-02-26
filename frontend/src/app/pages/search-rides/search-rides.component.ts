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

    this.http.get<Trajet[]>(`${environment.apiUrl}/trajets`).subscribe({
      next: (trajets) => {
        this.results = trajets;
        this.filteredResults = this.filterResults(trajets);
        this.isSearching = false;
      },
      error: () => {
        this.results = [];
        this.filteredResults = [];
        this.isSearching = false;
      }
    });
  }

  private filterResults(trajets: Trajet[]): Trajet[] {
    return trajets.filter(t => {
      const matchDepart = !this.departure ||
        t.villeDepart.toLowerCase().includes(this.departure.toLowerCase().split(',')[0]);
      const matchArrivee = !this.destination ||
        t.villeArrivee.toLowerCase().includes(this.destination.toLowerCase().split(',')[0]);
      const matchDate = !this.date || t.dateHeureDepart.startsWith(this.date);
      return matchDepart && matchArrivee && matchDate && t.placesDisponibles > 0;
    });
  }
}
