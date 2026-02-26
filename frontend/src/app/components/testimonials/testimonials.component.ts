import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Testimonial {
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
  avatarGradient: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss']
})
export class TestimonialsComponent {
  testimonials: Testimonial[] = [
    {
      name: 'Sophie Martin',
      role: 'Passagère régulière',
      text: 'Le système de points est génial ! Je conduis le lundi et j\'utilise mes points pour voyager le weekend. Zéro euro dépensé !',
      rating: 5,
      avatar: 'SM',
      avatarGradient: 'linear-gradient(135deg, #f97316, #ef4444)'
    },
    {
      name: 'Karim Benali',
      role: 'Conducteur',
      text: 'J\'accumule des points en proposant mes trajets quotidiens. La carte interactive et la messagerie rendent tout simple.',
      rating: 5,
      avatar: 'KB',
      avatarGradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
    },
    {
      name: 'Marie Leclerc',
      role: 'Étudiante',
      text: 'Parfait pour les étudiants ! Pas besoin d\'argent, juste des points. Les notifications me préviennent dès qu\'un trajet est dispo.',
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
