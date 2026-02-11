import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  user = { firstname: '', lastname: '', email: '', password: '' };

  successMessage: string | null = null;
  errorMessage: string | null = null;
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.loading = true;
    this.successMessage = null;
    this.errorMessage = null;

    this.authService.register(this.user).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage =
          'Inscription réussie ! Vous allez être redirigé vers la connexion...';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Erreur inscription:', err);

        if (err.status === 409) {
          this.errorMessage = 'Cet email est déjà utilisé.';
        } else {
          this.errorMessage =
            "Une erreur est survenue lors de l'inscription.";
        }
      }
    });
  }
}
