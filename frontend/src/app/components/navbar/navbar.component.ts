import {Component, OnInit} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {CommonModule, NgIf} from '@angular/common';
import {ThemeService} from '../../services/theme.service';
import {AuthService} from '../../services/auth.service';
import {UserService} from '../../services/user.service';
import {User} from '../../models/user.model';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [RouterLink, RouterLinkActive, NgIf, CommonModule],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

    user: User | undefined;

    constructor(
        public themeService: ThemeService,
        private authService: AuthService,
        private userService: UserService,
        private router: Router
    ) {
    }

    ngOnInit(): void {
        if (this.authService.isAuthenticated()) {
            this.loadUser();
        }
    }

    loadUser() {
        this.userService.getMyProfile().subscribe({
            next: (data) => {
                this.user = data;
                console.log('Utilisateur chargé dans la navbar:', this.user);
            },
            error: (err) => {
                console.error('Erreur chargement user navbar', err);
                this.user = undefined;
            }
        });
    }

    logout() {
        this.authService.logout();
        this.user = undefined;
        this.router.navigate(['/login']);
    }
}