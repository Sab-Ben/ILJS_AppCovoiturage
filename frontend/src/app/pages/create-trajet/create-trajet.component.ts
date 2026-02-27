import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoutingService } from '../../services/routing.service';
import { GeocodingService } from '../../services/geocoding.service';
import { debounceTime, distinctUntilChanged, forkJoin, map, Subject, Subscription, switchMap } from 'rxjs';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import * as TrajetActions from '../../store/trajet/trajet.actions';
import { environment } from '../../../environments/environment';

interface WizardStep {
  num: number;
  label: string;
  icon: string;
}

function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (environment.testMode) return null;
  if (!control.value) return null;
  const inputDate = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);
  if (inputDate < today) return { pastDate: true };
  return null;
}

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
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-trajet.component.html',
  styleUrls: ['./create-trajet.component.scss']
})
export class CreateTrajetComponent implements OnInit, OnDestroy {
  trajetForm: FormGroup;
  errorMsg = '';
  minDate = '';
  calculatingRoute = false;
  successMessage = '';
  currentStep = 0;
  slideDirection: 'left' | 'right' = 'right';

  readonly steps: WizardStep[] = [
    { num: 1, label: 'Itinéraire', icon: 'route' },
    { num: 2, label: 'Date & heure', icon: 'calendar' },
    { num: 3, label: 'Détails', icon: 'details' },
    { num: 4, label: 'Récapitulatif', icon: 'check' }
  ];

  private searchTerms = new Subject<{ field: string; query: string; index?: number }>();
  suggestionsDepart: { label: string; display_name: string; context: string; coords: number[] }[] = [];
  suggestionsArrivee: { label: string; display_name: string; context: string; coords: number[] }[] = [];
  suggestionsEtapes: { [key: number]: { label: string; display_name: string; context: string; coords: number[] }[] } = {};

  private subscription: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private geocodingService: GeocodingService,
    private routingService: RoutingService,
    private router: Router,
    private store: Store,
    private actions$: Actions
  ) {
    this.trajetForm = this.fb.group({
      villeDepart: ['', Validators.required],
      villeArrivee: ['', Validators.required],
      etapes: this.fb.array([]),
      dateDepart: ['', [Validators.required, futureDateValidator]],
      heureDepart: ['', Validators.required],
      placesDisponibles: [1, [Validators.required, Validators.min(1), Validators.max(4)]]
    }, { validators: differentCitiesValidator });

    this.subscription.add(
      this.actions$.pipe(ofType(TrajetActions.createTrajetSuccess)).subscribe(() => {
        this.successMessage = 'Trajet créé avec succès ! Redirection...';
        setTimeout(() => this.router.navigate(['/my-rides']), 1500);
      })
    );

    this.subscription.add(
      this.actions$.pipe(ofType(TrajetActions.createTrajetFailure)).subscribe(() => {
        this.errorMsg = 'Erreur lors de la sauvegarde du trajet.';
        this.calculatingRoute = false;
      })
    );
  }

  ngOnInit(): void {
    if (environment.testMode) {
      this.minDate = '';
    } else {
      const demain = new Date();
      demain.setDate(demain.getDate() + 1);
      this.minDate = demain.toISOString().split('T')[0];
    }

    this.searchTerms.pipe(
      debounceTime(800),
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

  get etapesControls(): FormArray {
    return this.trajetForm.get('etapes') as FormArray;
  }

  get isStep1Valid(): boolean {
    const depart = this.trajetForm.get('villeDepart');
    const arrivee = this.trajetForm.get('villeArrivee');
    return !!depart?.valid && !!arrivee?.valid && !this.trajetForm.hasError('sameCity');
  }

  get isStep2Valid(): boolean {
    const date = this.trajetForm.get('dateDepart');
    const heure = this.trajetForm.get('heureDepart');
    return !!date?.valid && !!heure?.valid;
  }

  get isStep3Valid(): boolean {
    const places = this.trajetForm.get('placesDisponibles');
    return !!places?.valid;
  }

  get canGoNext(): boolean {
    switch (this.currentStep) {
      case 0: return this.isStep1Valid;
      case 1: return this.isStep2Valid;
      case 2: return this.isStep3Valid;
      default: return false;
    }
  }

  get formattedDate(): string {
    const val = this.trajetForm.get('dateDepart')?.value;
    if (!val) return '';
    const date = new Date(val);
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  goToStep(stepIndex: number): void {
    if (stepIndex < this.currentStep) {
      this.slideDirection = 'left';
      this.currentStep = stepIndex;
    }
  }

  nextStep(): void {
    if (this.currentStep < 3 && this.canGoNext) {
      this.slideDirection = 'right';
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.slideDirection = 'left';
      this.currentStep--;
    }
  }

  addEtape(): void {
    this.etapesControls.push(this.fb.control(''));
  }

  removeEtape(index: number): void {
    this.etapesControls.removeAt(index);
    delete this.suggestionsEtapes[index];
  }

  onSearchInput(field: string, query: string, index?: number): void {
    this.searchTerms.next({ field, query, index });
  }

  selectAddress(field: string, address: { label: string; display_name: string }, index?: number): void {
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

  clearSuggestions(): void {
    setTimeout(() => {
      this.suggestionsDepart = [];
      this.suggestionsArrivee = [];
      this.suggestionsEtapes = {};
    }, 200);
  }

  onSubmit(): void {
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
      { label: "Ville d'arrivée", address: formVal.villeArrivee }
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
          throw new Error(`Adresse(s) introuvable(s) : ${labels}`);
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
        this.store.dispatch(TrajetActions.createTrajet({ trajet: nouveauTrajet }));
      },
      error: (err) => {
        this.errorMsg = err.message || "Impossible de calculer l'itinéraire.";
        this.calculatingRoute = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
