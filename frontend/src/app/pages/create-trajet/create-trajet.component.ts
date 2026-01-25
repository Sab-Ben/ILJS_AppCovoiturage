import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { TrajetService } from '../../services/trajet.service';

// --- Définition du validateur en dehors de la classe ---
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
// ------------------------------------------------------------------------

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

  constructor(
      private fb: FormBuilder,
      private trajetService: TrajetService,
      private router: Router
  ) {
    this.trajetForm = this.fb.group({
      villeDepart: ['', Validators.required],
      villeArrivee: ['', Validators.required],
      etapes: this.fb.array([]),

      dateDepart: ['', [Validators.required, futureDateValidator]],

      heureDepart: ['', Validators.required],
      placesDisponibles: [1, [Validators.required, Validators.min(1), Validators.max(4)]]
    });
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
    if (this.trajetForm.valid) {
      const formVal = this.trajetForm.value;
      const dateHeure = `${formVal.dateDepart}T${formVal.heureDepart}:00`;

      const etapesNettoyees = formVal.etapes
          ? formVal.etapes.filter((e: string) => e && e.trim() !== '')
          : [];

      const nouveauTrajet = {
        villeDepart: formVal.villeDepart,
        villeArrivee: formVal.villeArrivee,
        etapes: etapesNettoyees,
        dateHeureDepart: dateHeure,
        placesDisponibles: formVal.placesDisponibles
      };

      this.trajetService.createTrajet(nouveauTrajet).subscribe({
        next: () => this.router.navigate(['/profile']),
        error: (err) => {
          console.error(err);
          this.errorMsg = 'Erreur lors de la création du trajet';
        }
      });
    }
  }
}