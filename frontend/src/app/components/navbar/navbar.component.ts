import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { StompSubscription } from '@stomp/stompjs';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { WsService } from '../../services/ws.service';
import { ToastService } from '../../services/toast.service';
import { User } from '../../models/user.model';
import { AppNotification } from '../../models/notification.model';
import { WsEvent } from '../../models/ws-event.model';
import * as NotificationActions from '../../store/notification/notification.actions';
import * as PointActions from '../../store/point/point.actions';
import * as TrajetActions from '../../store/trajet/trajet.actions';
import * as UserActions from '../../store/user/user.actions';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, NotificationBellComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  user: User | undefined;
  isScrolled = false;
  isDarkMode = false;
  mobileMenuOpen = false;

  private notifWsSub: StompSubscription | null = null;
  private userSub: Subscription | undefined;

  constructor(
    private themeService: ThemeService,
    private authService: AuthService,
    private userService: UserService,
    private wsService: WsService,
    private toastService: ToastService,
    private store: Store,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isDarkMode = this.themeService.darkMode();
    if (this.authService.isAuthenticated()) {
      this.wsService.connect();
      this.loadUser();
    }
  }

  ngOnDestroy(): void {
    this.notifWsSub?.unsubscribe();
    this.userSub?.unsubscribe();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 10;
  }

  loadUser(): void {
    this.userSub = this.userService.getMyProfile().subscribe({
      next: (data) => {
        this.user = data;
        this.store.dispatch(UserActions.loadMyProfileSuccess({ user: data }));
        this.subscribeToNotifications(data.id);
      },
      error: () => this.user = undefined
    });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDarkMode = this.themeService.darkMode();
  }

  logout(): void {
    this.wsService.disconnect();
    this.notifWsSub?.unsubscribe();
    this.authService.logout();
    this.user = undefined;
    this.router.navigate(['/auth']);
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  private subscribeToNotifications(userId: number): void {
    this.notifWsSub?.unsubscribe();
    this.notifWsSub = this.wsService.subscribeToUserNotifications(userId,
      (event: WsEvent<AppNotification>) => {
        if (event.type === 'NOTIFICATION_CREATED') {
          const notification = event.payload;

          this.store.dispatch(NotificationActions.notificationReceivedRealtime({ notification }));
          this.store.dispatch(NotificationActions.loadUnreadCount());

          this.handleNotificationToast(notification);

          if (notification.type === 'POINTS_CREDITED' || notification.type === 'POINTS_DEBITED' || notification.type === 'LEVEL_UP') {
            this.store.dispatch(PointActions.loadBalance());
            this.store.dispatch(PointActions.loadHistory());
          }

          if (notification.type === 'RESERVATION_CREATED' || notification.type === 'RESERVATION_CANCELLED') {
            this.store.dispatch(TrajetActions.loadTrajets());
          }
        }
      }
    );
  }

  private handleNotificationToast(notification: AppNotification): void {
    switch (notification.type) {
      case 'POINTS_CREDITED':
        this.toastService.success(notification.title, notification.content, 7000);
        break;
      case 'POINTS_DEBITED':
        this.toastService.show(notification.title, notification.content, 'warning', 5000);
        break;
      case 'LEVEL_UP':
        this.toastService.success(notification.title, notification.content, 10000);
        break;
      case 'RESERVATION_CONFIRMED':
        this.toastService.success(notification.title, notification.content, 5000);
        break;
      case 'RESERVATION_CANCELLED':
        this.toastService.show(notification.title, notification.content, 'warning', 5000);
        break;
      case 'RESERVATION_CREATED':
        this.toastService.show(notification.title, notification.content, 'info', 5000);
        break;
      case 'MESSAGE_RECEIVED':
        this.toastService.show(notification.title, notification.content, 'info', 4000);
        break;
      default:
        this.toastService.show(notification.title, notification.content, 'info', 5000);
        break;
    }
  }
}
