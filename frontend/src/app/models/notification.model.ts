export interface NotificationModel {
  id: number;
  type: string; // ex: "MESSAGE_RECEIVED", "RESERVATION_CREATED", ...
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string; // ISO string
  referenceType?: string | null;
  referenceId?: number | null;
}

export interface UnreadCountResponse {
  count: number;
}
