import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent {
  departure = '';
  arrival = '';
  selectedDate = '';

  onSearch(): void {
    if (this.departure && this.arrival && this.selectedDate) {
      const params = new URLSearchParams({
        departure: this.departure,
        arrival: this.arrival,
        date: this.selectedDate
      });
    }
  }
}
