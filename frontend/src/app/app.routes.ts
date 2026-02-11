import { Routes } from '@angular/router';
import {LoginComponent} from "./pages/login/login.component";
import {RegisterComponent} from "./pages/register/register.component";
import {ProfileComponent} from "./pages/profile/profile.component";
import {authGuard} from "./guards/auth.guard";
import {CreateTrajetComponent} from "./pages/create-trajet/create-trajet.component";
import {MyRidesComponent} from "./pages/my-rides/my-rides.component";
import { SearchRideComponent } from './pages/search-ride/search-ride.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
    { path: 'create-ride', component: CreateTrajetComponent, canActivate: [authGuard] },
    { path: 'my-rides', component: MyRidesComponent, canActivate: [authGuard] },
    { path: 'search-ride', component: SearchRideComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: 'login' }
];
