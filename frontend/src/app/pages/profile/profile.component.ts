import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import {User} from "../../models/user.model";
import {Role} from "../../models/role.enum";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  user: User | undefined;
  isEditing = false;
  successMessage = '';
  roles = Object.values(Role);

  constructor(private userService: UserService, private authService: AuthService) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.userService.getMyProfile().subscribe({
      next: (data) => this.user = data,
      error: (err) => console.error('Erreur chargement profil', err)
    });
  }

  saveProfile() {
    this.userService.updateProfile(this.user).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.isEditing = false;
        this.successMessage = 'Profil mis à jour avec succès !';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => console.error(err)
    });
  }

  logout() {
    this.authService.logout();
  }
}