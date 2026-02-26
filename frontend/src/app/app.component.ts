import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ThemeService} from './services/theme.service';
import {NavbarComponent} from './components/navbar/navbar.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NavbarComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    title = 'IJLS Covoiturage.';
    themeService = inject(ThemeService);
}