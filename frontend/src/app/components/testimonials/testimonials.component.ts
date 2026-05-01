import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface Testimonial {
  name: string;
  roleKey: string;
  textKey: string;
  rating: number;
  avatar: string;
  avatarGradient: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss']
})
export class TestimonialsComponent {
  testimonials: Testimonial[] = [
    {
      name: 'Sophie Martin',
      roleKey: 'LANDING.TESTIMONIAL1_ROLE',
      textKey: 'LANDING.TESTIMONIAL1_TEXT',
      rating: 5,
      avatar: 'SM',
      avatarGradient: 'linear-gradient(135deg, #f97316, #ef4444)'
    },
    {
      name: 'Karim Benali',
      roleKey: 'LANDING.TESTIMONIAL2_ROLE',
      textKey: 'LANDING.TESTIMONIAL2_TEXT',
      rating: 5,
      avatar: 'KB',
      avatarGradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
    },
    {
      name: 'Marie Leclerc',
      roleKey: 'LANDING.TESTIMONIAL3_ROLE',
      textKey: 'LANDING.TESTIMONIAL3_TEXT',
      rating: 5,
      avatar: 'ML',
      avatarGradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)'
    }
  ];

  trackByIndex(index: number): number {
    return index;
  }

  getRatingArray(rating: number): number[] {
    return Array.from({ length: rating }, (_, i) => i);
  }
}
