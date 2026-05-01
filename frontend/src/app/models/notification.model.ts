export type NotificationType =
  | 'RESERVATION_CREATED'
  | 'RESERVATION_CONFIRMED'
  | 'RESERVATION_CANCELLED'
  | 'TRAJET_DELETED'
  | 'MESSAGE_RECEIVED'
  | 'LEVEL_UP'
  | 'POINTS_CREDITED'
  | 'POINTS_DEBITED';

export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  referenceType?: string;
  referenceId?: number;
}
