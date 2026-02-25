import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { ThemeService } from './services/theme.service';
import { NavbarComponent } from './components/navbar/navbar.component';
import { WsService } from './services/ws.service';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';

import * as NotificationActions from './store/notification/notification.actions';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'IJLS Covoiturage.';
  themeService = inject(ThemeService);

  private wsService = inject(WsService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private store = inject(Store);

  private profileSub?: Subscription;
  private notificationWsSub: any = null;
  private alreadySubscribed = false;

  ngOnInit(): void {
    // Charge les notifications existantes au démarrage
    if (this.authService.isAuthenticated()) {
      this.store.dispatch(NotificationActions.loadNotifications());
      this.store.dispatch(NotificationActions.loadUnreadCount());

      // Connexion WS globale (pas seulement dans la page messaging)
      this.wsService.connect();

      this.profileSub = this.userService.getMyProfile().subscribe({
        next: (user: any) => {
          if (!user?.id || this.alreadySubscribed) return;

          this.notificationWsSub = this.wsService.subscribeToUserNotifications(
            user.id,
            (event: any) => {
              if (event?.type === 'NOTIFICATION_CREATED' && event?.payload) {
                this.store.dispatch(
                  NotificationActions.notificationReceivedRealtime({
                    notification: event.payload
                  })
                );
              }
            }
          );

          this.alreadySubscribed = true;
        },
        error: (err) => {
          console.error('[App] impossible de charger le profil pour WS', err);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.profileSub?.unsubscribe();
    this.notificationWsSub?.unsubscribe?.();
  }
}
