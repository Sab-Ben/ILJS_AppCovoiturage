import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import * as NotificationActions from './notification.actions';
import { NotificationService } from '../../services/notification.service';

@Injectable()
export class NotificationEffects {
  private actions$ = inject(Actions);
  private notificationService = inject(NotificationService);

  loadNotifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationActions.loadNotifications),
      mergeMap(() =>
        this.notificationService.getMyNotifications().pipe(
          map((notifications) => NotificationActions.loadNotificationsSuccess({ notifications })),
          catchError((error) => of(NotificationActions.loadNotificationsFailure({ error })))
        )
      )
    )
  );

  loadUnreadCount$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationActions.loadUnreadCount),
      mergeMap(() =>
        this.notificationService.getUnreadCount().pipe(
          map((res) => NotificationActions.loadUnreadCountSuccess({ count: res.count })),
          catchError((error) => of(NotificationActions.loadUnreadCountFailure({ error })))
        )
      )
    )
  );

  markAsRead$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationActions.markNotificationAsRead),
      mergeMap(({ id }) =>
        this.notificationService.markAsRead(id).pipe(
          map((notification) => NotificationActions.markNotificationAsReadSuccess({ notification })),
          catchError((error) => of(NotificationActions.markNotificationAsReadFailure({ error })))
        )
      )
    )
  );

  markAllAsRead$ = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationActions.markAllNotificationsAsRead),
      mergeMap(() =>
        this.notificationService.markAllAsRead().pipe(
          map(() => NotificationActions.markAllNotificationsAsReadSuccess()),
          catchError((error) => of(NotificationActions.markAllNotificationsAsReadFailure({ error })))
        )
      )
    )
  );
}
