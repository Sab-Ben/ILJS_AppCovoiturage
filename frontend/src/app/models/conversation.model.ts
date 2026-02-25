export interface ConversationModel {
  id: number;
  trajetId: number | null;
  otherUserId: number;
  otherUserName: string;
  createdAt: string;
  unreadCount: number;
}

export type Conversation = ConversationModel;
