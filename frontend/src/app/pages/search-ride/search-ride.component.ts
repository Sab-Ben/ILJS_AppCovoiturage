import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-ride',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-ride.component.html',
  styleUrls: ['./search-ride.component.scss'],
})
export class SearchRideComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // Formulaire : lieu départ, lieu arrivée, date
  form = this.fb.group({
    from: ['', [Validators.required, Validators.minLength(2)]],
    to: ['', [Validators.required, Validators.minLength(2)]],
    date: ['', [Validators.required]], // format YYYY-MM-DD depuis input type="date"
  });

  // Helpers pour HTML
  get fromCtrl() { return this.form.controls.from; }
  get toCtrl() { return this.form.controls.to; }
  get dateCtrl() { return this.form.controls.date; }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const from = (this.form.value.from ?? '').trim();
    const to = (this.form.value.to ?? '').trim();
    const date = this.form.value.date ?? '';

    // Optionnel : empêcher from == to
    if (from.toLowerCase() === to.toLowerCase()) {
      this.toCtrl.setErrors({ sameAsFrom: true });
      return;
    }

    // Navigation vers la page des résultats
    this.router.navigate(['/ride-results'], {
      queryParams: { from, to, date }
    });
  }

  reset(): void {
    this.form.reset();
  }
}
