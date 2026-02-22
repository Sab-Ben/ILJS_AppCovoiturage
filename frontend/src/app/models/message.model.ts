export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderEmail: string;
  content: string;
  sentAt: string;
}

export interface SendMessageRequest {
  content: string;
}
