import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { TrajetService } from '../../services/trajet.service';
import { RoutingService } from '../../services/routing.service';
import { GeocodingService } from '../../services/geocoding.service';
import { forkJoin, switchMap, map } from "rxjs";

// --- Validateur Date ---
function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const inputDate = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);
  if (inputDate <= today) {
    return { 'pastDate': true };
  }
  return null;
}

// --- NOUVEAU : Validateur Villes Identiques ---
function differentCitiesValidator(group: AbstractControl): ValidationErrors | null {
  const depart = group.get('villeDepart')?.value;
  const arrivee = group.get('villeArrivee')?.value;

  // On compare les villes en minuscules et sans espaces inutiles
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
  errorMessage = '';

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
    }, { validators: differentCitiesValidator }); // <-- Ajout du validateur global ici
  }

  ngOnInit(): void {
    const demain = new Date();
    demain.setDate(demain.getDate() + 1);
    this.minDate = demain.toISOString().split('T')[0];
  }

  get etapesControls() {
    return (this.trajetForm.get('etapes') as FormArray);
  }

  addEtape() {
    this.etapesControls.push(this.fb.control(''));
  }

  removeEtape(index: number) {
    this.etapesControls.removeAt(index);
  }

  onSubmit() {
    if (this.trajetForm.invalid) return;

    this.calculatingRoute = true;
    this.errorMsg = ''; // Reset erreur
    const formVal = this.trajetForm.value;

    const etapesNettoyees = formVal.etapes
        ? formVal.etapes.filter((e: string) => e && e.trim() !== '')
        : [];

    const villes = [formVal.villeDepart, ...etapesNettoyees, formVal.villeArrivee];

    const geocodingRequests = villes.map(v => this.geocodingService.getCoordinates(v));

    forkJoin(geocodingRequests).pipe(
        switchMap(coords => {
          const validCoords = coords.filter(c => c !== null) as number[][];

          if (validCoords.length < 2) {
            throw new Error('Impossible de trouver les coordonnées des villes.');
          }

          const startCoords = validCoords[0];
          const endCoords = validCoords[validCoords.length - 1];

          return this.routingService.getRouteData(validCoords).pipe(
              map(routeData => ({
                routeData,
                startCoords,
                endCoords
              }))
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
            this.successMessage = 'Trajet créé avec succès ! Redirection en cours...';

            setTimeout(() => {
              this.router.navigate(['/my-rides']);
            }, 1500)
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
        this.errorMsg = 'Impossible de calculer l\'itinéraire (vérifiez les noms des villes).';
        this.calculatingRoute = false;
      }
    });
  }
}