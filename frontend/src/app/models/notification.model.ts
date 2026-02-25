export type NotificationType =
  | 'RESERVATION_CREATED'
  | 'TRAJET_CREATED'
  | 'TRAJET_UPDATED'
  | 'TRAJET_DELETED'
  | 'MESSAGE_RECEIVED';

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
