import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  Subject,
  Subscription,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  forkJoin,
  of
} from 'rxjs';

import { GeocodingService } from '../../services/geocoding.service';

@Component({
  selector: 'app-search-ride',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-ride.component.html',
  styleUrls: ['./search-ride.component.scss'],
})
export class SearchRideComponent implements OnInit, OnDestroy {
  from: string = '';
  to: string = '';
  date: string = '';

  errorMsg: string = '';
  searching = false;

  private searchTerms = new Subject<{ field: string; query: string }>();
  suggestionsDepart: any[] = [];
  suggestionsArrivee: any[] = [];

  private subscription: Subscription = new Subscription();

  constructor(
      private router: Router,
      private geocodingService: GeocodingService
  ) {}

  ngOnInit(): void {
    // Même logique de recherche que dans create-trajet
    this.subscription.add(
        this.searchTerms.pipe(
            debounceTime(1000),
            map(t => ({ ...t, query: (t.query || '').trim() })),
            distinctUntilChanged((a, b) => a.field === b.field && a.query === b.query),
            switchMap((term) => {
              if (!term.query || term.query.length < 3) return of({ results: [] as any[], term });
              return this.geocodingService.searchAddresses(term.query).pipe(
                  map(results => ({ results, term }))
              );
            })
        ).subscribe({
          next: ({ results, term }) => {
            if (term.field === 'depart') this.suggestionsDepart = results;
            else if (term.field === 'arrivee') this.suggestionsArrivee = results;
          },
          error: (err) => console.error(err)
        })
    );
  }

  onSearchInput(field: string, query: string): void {
    if (!query || !query.trim()) {
      if (field === 'depart') this.suggestionsDepart = [];
      if (field === 'arrivee') this.suggestionsArrivee = [];
      return;
    }
    this.searchTerms.next({ field, query });
  }

  selectAddress(field: string, address: any): void {
    const val = address.label || address.display_name;

    if (field === 'depart') {
      this.from = val;
      this.suggestionsDepart = [];
    } else if (field === 'arrivee') {
      this.to = val;
      this.suggestionsArrivee = [];
    }
  }

  clearSuggestions(): void {
    setTimeout(() => {
      this.suggestionsDepart = [];
      this.suggestionsArrivee = [];
    }, 200);
  }

  onSearch(): void {
    this.errorMsg = '';
    this.searching = true;

    const fromTxt = (this.from || '').trim();
    const toTxt = (this.to || '').trim();

    const from$ = fromTxt
        ? this.geocodingService.getCoordinates(fromTxt).pipe(map(coords => ({ label: 'Ville de départ', coords })))
        : of({ label: 'Ville de départ', coords: null });

    const to$ = toTxt
        ? this.geocodingService.getCoordinates(toTxt).pipe(map(coords => ({ label: "Ville d'arrivée", coords })))
        : of({ label: "Ville d'arrivée", coords: null });

    forkJoin([from$, to$]).subscribe({
      next: ([fromRes, toRes]) => {
        if (fromTxt && !fromRes.coords) {
          this.errorMsg = "Adresse de départ introuvable en France. Vérifie l'orthographe ou choisis une suggestion.";
          this.searching = false;
          return;
        }
        if (toTxt && !toRes.coords) {
          this.errorMsg = "Adresse d'arrivée introuvable en France. Vérifie l'orthographe ou choisis une suggestion.";
          this.searching = false;
          return;
        }

        const queryParams: any = {};
        if (fromTxt) queryParams.from = fromTxt;
        if (toTxt) queryParams.to = toTxt;
        if (this.date) queryParams.date = this.date;

        this.searching = false;
        this.router.navigate(['/ride-results'], { queryParams });
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = err?.message || "Erreur lors de la recherche d'adresses.";
        this.searching = false;
      }
    });
  }

  onReset(): void {
    this.from = '';
    this.to = '';
    this.date = '';
    this.errorMsg = '';
    this.suggestionsDepart = [];
    this.suggestionsArrivee = [];
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}