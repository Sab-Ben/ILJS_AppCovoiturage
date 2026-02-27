import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss']
})
export class HeroSectionComponent {
  departure = '';
  arrival = '';
  selectedDate = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSearch(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth']);
      return;
    }

    if (this.departure || this.arrival) {
      this.router.navigate(['/search-rides'], {
        queryParams: {
          from: this.departure,
          to: this.arrival,
          date: this.selectedDate
        }
      });
    }
  }
}
