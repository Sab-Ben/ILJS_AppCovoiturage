import { Routes } from '@angular/router';
import { ProfileComponent } from './pages/profile/profile.component';
import { authGuard } from './guards/auth.guard';
import { CreateTrajetComponent } from './pages/create-trajet/create-trajet.component';
import { MyRidesComponent } from './pages/my-rides/my-rides.component';
import { LandingComponent } from './pages/landing/landing.component';
import { AuthComponent } from './pages/auth/auth.component';
import { SearchRidesComponent } from './pages/search-rides/search-rides.component';
import { SearchRideComponent } from './pages/search-ride/search-ride.component';
import { RideResultsComponent } from './pages/ride-results/ride-results.component';
import { RideDetailComponent } from './pages/ride-detail/ride-detail.component';
import { CompletedRidesComponent } from './pages/completed-rides/completed-rides.component';
import { MessagingComponent } from './pages/messaging/messaging.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'login', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'create-ride', component: CreateTrajetComponent, canActivate: [authGuard] },
  { path: 'my-rides', component: MyRidesComponent, canActivate: [authGuard] },
  { path: 'search-rides', component: SearchRidesComponent, canActivate: [authGuard] },
  { path: 'search-ride', component: SearchRideComponent, canActivate: [authGuard] },
  { path: 'ride-results', component: RideResultsComponent },
  { path: 'ride/:id', component: RideDetailComponent },
  { path: 'completed-rides', component: CompletedRidesComponent, canActivate: [authGuard] },
  { path: 'messaging', component: MessagingComponent, canActivate: [authGuard] },
  {
    path: 'my-reservations',
    loadComponent: () =>
      import('./pages/my-reservations/my-reservations.component')
        .then(m => m.MyReservationsComponent),
  },
  { path: '**', redirectTo: '' }
];
