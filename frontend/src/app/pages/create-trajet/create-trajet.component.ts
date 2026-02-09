import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { TrajetService } from '../../services/trajet.service';
import { RoutingService } from '../../services/routing.service';
import { GeocodingService } from '../../services/geocoding.service';
import { forkJoin, switchMap, map, Subject, debounceTime, distinctUntilChanged } from "rxjs";

// Validateur Date
function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const inputDate = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);
  if (inputDate <= today) return { 'pastDate': true };
  return null;
}

// Validateur Villes Identiques
function differentCitiesValidator(group: AbstractControl): ValidationErrors | null {
  const depart = group.get('villeDepart')?.value;
  const arrivee = group.get('villeArrivee')?.value;
  if (depart && arrivee && depart.trim().toLowerCase() === arrivee.trim().toLowerCase()) {
    return { sameCity: true };
  }
  return null;
}

@Component({
  selector: 'app-create-trajet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-trajet.component.html',
  styleUrls: ['./create-trajet.component.scss']
})
export class CreateTrajetComponent implements OnInit {
  trajetForm: FormGroup;
  errorMsg: string = '';
  minDate: string = '';
  calculatingRoute = false;
  successMessage = '';

  private searchTerms = new Subject<{ field: string, query: string, index?: number }>();
  suggestionsDepart: any[] = [];
  suggestionsArrivee: any[] = [];
  suggestionsEtapes: { [key: number]: any[] } = {};

  constructor(
      private fb: FormBuilder,
      private trajetService: TrajetService,
      private geocodingService: GeocodingService,
      private routingService: RoutingService,
      private router: Router
  ) {
    this.trajetForm = this.fb.group({
      villeDepart: ['', Validators.required],
      villeArrivee: ['', Validators.required],
      etapes: this.fb.array([]),
      dateDepart: ['', [Validators.required, futureDateValidator]],
      heureDepart: ['', Validators.required],
      placesDisponibles: [1, [Validators.required, Validators.min(1), Validators.max(4)]]
    }, { validators: differentCitiesValidator });
  }

  ngOnInit(): void {
    const demain = new Date();
    demain.setDate(demain.getDate() + 1);
    this.minDate = demain.toISOString().split('T')[0];

    this.searchTerms.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => this.geocodingService.searchAddresses(term.query).pipe(
            map(results => ({ results, term }))
        ))
    ).subscribe({
      next: ({ results, term }) => {
        if (term.field === 'depart') this.suggestionsDepart = results;
        else if (term.field === 'arrivee') this.suggestionsArrivee = results;
        else if (term.field === 'etape' && term.index !== undefined) this.suggestionsEtapes[term.index] = results;
      }
    });
  }

  get etapesControls() {
    return (this.trajetForm.get('etapes') as FormArray);
  }

  addEtape() {
    this.etapesControls.push(this.fb.control(''));
  }

  removeEtape(index: number) {
    this.etapesControls.removeAt(index);
    delete this.suggestionsEtapes[index];
  }

  onSearchInput(field: string, query: string, index?: number): void {
    this.searchTerms.next({ field, query, index });
  }

  selectAddress(field: string, address: any, index?: number): void {
    const val = address.label || address.display_name;

    if (field === 'depart') {
      this.trajetForm.patchValue({ villeDepart: val });
      this.suggestionsDepart = [];
    } else if (field === 'arrivee') {
      this.trajetForm.patchValue({ villeArrivee: val });
      this.suggestionsArrivee = [];
    } else if (field === 'etape' && index !== undefined) {
      this.etapesControls.at(index).setValue(val);
      this.suggestionsEtapes[index] = [];
    }
  }

  clearSuggestions() {
    setTimeout(() => {
      this.suggestionsDepart = [];
      this.suggestionsArrivee = [];
      this.suggestionsEtapes = {};
    }, 200);
  }

  // --- Soumission ---
  onSubmit() {
    if (this.trajetForm.invalid) return;

    this.calculatingRoute = true;
    this.errorMsg = '';
    const formVal = this.trajetForm.value;

    const etapesNettoyees = formVal.etapes
        ? formVal.etapes.filter((e: string) => e && e.trim() !== '')
        : [];

    const requests = [
      { label: 'Ville de départ', address: formVal.villeDepart },
      ...etapesNettoyees.map((e: string, index: number) => ({ label: `Étape ${index + 1}`, address: e })),
      { label: 'Ville d\'arrivée', address: formVal.villeArrivee }
    ];

    const geocodingObservables = requests.map(req =>
        this.geocodingService.getCoordinates(req.address).pipe(
            map(coords => ({ ...req, coords }))
        )
    );

    forkJoin(geocodingObservables).pipe(
        switchMap(results => {
          const invalidResults = results.filter(r => r.coords === null);

          if (invalidResults.length > 0) {
            const labels = invalidResults.map(r => r.label).join(', ');
            throw new Error(`Adresse(s) introuvable(s) en France : ${labels}. Veuillez vérifier l'orthographe ou sélectionner une suggestion.`);
          }

          const validCoords = results.map(r => r.coords) as number[][];
          const startCoords = validCoords[0];
          const endCoords = validCoords[validCoords.length - 1];

          return this.routingService.getRouteData(validCoords).pipe(
              map(routeData => ({ routeData, startCoords, endCoords }))
          );
        })
    ).subscribe({
      next: (result) => {
        const { routeData, startCoords, endCoords } = result;
        const dateHeure = `${formVal.dateDepart}T${formVal.heureDepart}:00`;

        const nouveauTrajet = {
          villeDepart: formVal.villeDepart,
          villeArrivee: formVal.villeArrivee,
          etapes: etapesNettoyees,
          dateHeureDepart: dateHeure,
          placesDisponibles: formVal.placesDisponibles,
          distanceKm: routeData.distanceKm,
          dureeEstimee: routeData.duree,
          latitudeDepart: startCoords[0],
          longitudeDepart: startCoords[1],
          latitudeArrivee: endCoords[0],
          longitudeArrivee: endCoords[1]
        };

        this.trajetService.createTrajet(nouveauTrajet).subscribe({
          next: () => {
            this.successMessage = 'Trajet créé avec succès ! Redirection...';
            setTimeout(() => this.router.navigate(['/my-rides']), 1500);
          },
          error: (err) => {
            console.error(err);
            this.errorMsg = 'Erreur lors de la sauvegarde du trajet.';
            this.calculatingRoute = false;
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = err.message || 'Impossible de calculer l\'itinéraire.';
        this.calculatingRoute = false;
      }
    });
  }
}