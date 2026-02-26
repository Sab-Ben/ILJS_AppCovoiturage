import {Routes} from '@angular/router';
import {LoginComponent} from "./pages/login/login.component";
import {RegisterComponent} from "./pages/register/register.component";
import {ProfileComponent} from "./pages/profile/profile.component";
import {authGuard} from "./guards/auth.guard";
import {CreateTrajetComponent} from "./pages/create-trajet/create-trajet.component";
import {MyRidesComponent} from "./pages/my-rides/my-rides.component";
import {SearchRideComponent} from './pages/search-ride/search-ride.component';
import {RideResultsComponent} from './pages/ride-results/ride-results.component';
import {RideDetailComponent} from './pages/ride-detail/ride-detail.component';
import {CompletedRidesComponent} from './pages/completed-rides/completed-rides.component';
import {MyReservationsComponent} from "./pages/my-reservations/my-reservations.component";
import {MessagingComponent} from "./pages/messaging/messaging.component";


export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'profile', component: ProfileComponent, canActivate: [authGuard]},
    {path: 'create-ride', component: CreateTrajetComponent, canActivate: [authGuard]},
    {path: 'my-rides', component: MyRidesComponent, canActivate: [authGuard]},
    {path: 'search-ride', component: SearchRideComponent, canActivate: [authGuard]},
    {path: 'my-reservations', component: MyReservationsComponent, canActivate: [authGuard]},
    {path: 'ride-results', component: RideResultsComponent, canActivate: [authGuard]},
    {path: 'ride-detail/:id', component: RideDetailComponent, canActivate: [authGuard]},
    {path: 'completed-rides', component: CompletedRidesComponent, canActivate: [authGuard]},
    {path: 'messaging', component: MessagingComponent, canActivate: [authGuard]},
    {path: '**', redirectTo: 'login'}
];
