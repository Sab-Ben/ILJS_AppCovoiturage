import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  user = { firstname: '', lastname: '', email: '', password: '' };

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.authService.register(this.user).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => console.error(err)
    });
  }
}