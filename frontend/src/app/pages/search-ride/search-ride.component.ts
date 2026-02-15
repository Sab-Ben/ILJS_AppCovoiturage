import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-ride',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-ride.component.html',
  styleUrls: ['./search-ride.component.scss'],
})
export class SearchRideComponent {
  // champs bindés au formulaire
  from: string = '';
  to: string = '';
  date: string = '';

  constructor(private router: Router) {}

  onSearch(): void {
    // construit des query params propres (sans vide)
    const queryParams: any = {};
    if (this.from.trim()) queryParams.from = this.from.trim();
    if (this.to.trim()) queryParams.to = this.to.trim();
    if (this.date) queryParams.date = this.date;

    // adapte la route si besoin (ex: /ride-results)
    this.router.navigate(['/ride-results'], { queryParams });
  }

  onReset(): void {
    this.from = '';
    this.to = '';
    this.date = '';
  }
}
