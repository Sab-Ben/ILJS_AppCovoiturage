import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TrajetService } from '../../services/trajet.service';

@Component({
  selector: 'app-create-trajet',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-trajet.component.html',
  styleUrls: ['./create-trajet.component.scss']
})
export class CreateTrajetComponent {
  trajetForm: FormGroup;
  errorMsg: string = '';

  constructor(
      private fb: FormBuilder,
      private trajetService: TrajetService,
      private router: Router
  ) {
    this.trajetForm = this.fb.group({
      villeDepart: ['', Validators.required],
      villeArrivee: ['', Validators.required],
      dateDepart: ['', Validators.required],
      heureDepart: ['', Validators.required],
      placesDisponibles: [1, [Validators.required, Validators.min(1)]]
    });
  }

  onSubmit() {
    if (this.trajetForm.valid) {
      const formVal = this.trajetForm.value;

      const dateHeure = `${formVal.dateDepart}T${formVal.heureDepart}:00`;

      const nouveauTrajet = {
        villeDepart: formVal.villeDepart,
        villeArrivee: formVal.villeArrivee,
        dateHeureDepart: dateHeure,
        placesDisponibles: formVal.placesDisponibles
      };

      this.trajetService.createTrajet(nouveauTrajet).subscribe({
        next: () => {
          this.router.navigate(['/profile']);
        },
        error: (err) => {
          console.error(err);
          this.errorMsg = 'Erreur lors de la création du trajet';
        }
      });
    }
  }
}