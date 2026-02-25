import { createAction, props } from '@ngrx/store';
import { ConversationModel } from '../../models/conversation.model';
import { MessageModel } from '../../models/message.model';

/**
 * Conversations
 */
export const loadConversations = createAction('[Message] Load Conversations');

export const loadConversationsSuccess = createAction(
  '[Message] Load Conversations Success',
  props<{ conversations: ConversationModel[] }>()
);

export const loadConversationsFailure = createAction(
  '[Message] Load Conversations Failure',
  props<{ error: any }>()
);

/**
 * Sélection conversation (nouveau nom)
 */
export const selectConversation = createAction(
  '[Message] Select Conversation',
  props<{ conversationId: number }>()
);

export const setActiveConversation = createAction(
  '[Message] Set Active Conversation',
  props<{ conversationId: number }>()
);

/**
 * Messages
 */
export const loadMessages = createAction(
  '[Message] Load Messages',
  props<{ conversationId: number }>()
);

export const loadMessagesSuccess = createAction(
  '[Message] Load Messages Success',
  props<{ conversationId: number; messages: MessageModel[] }>()
);

export const loadMessagesFailure = createAction(
  '[Message] Load Messages Failure',
  props<{ error: any }>()
);

export const sendMessage = createAction(
  '[Message] Send Message',
  props<{ conversationId: number; content: string }>()
);

export const sendMessageSuccess = createAction(
  '[Message] Send Message Success',
  props<{ message: MessageModel }>()
);

export const sendMessageFailure = createAction(
  '[Message] Send Message Failure',
  props<{ error: any }>()
);

export const markConversationAsRead = createAction(
  '[Message] Mark Conversation As Read',
  props<{ conversationId: number }>()
);

export const markConversationAsReadSuccess = createAction(
  '[Message] Mark Conversation As Read Success',
  props<{ conversationId: number }>()
);

export const markConversationAsReadFailure = createAction(
  '[Message] Mark Conversation As Read Failure',
  props<{ error: any }>()
);

/**
 * Realtime (WebSocket)
 */
export const messageReceivedRealtime = createAction(
  '[Message] Realtime Received',
  props<{ message: MessageModel }>()
);

export const clearMessages = createAction('[Message] Clear');
