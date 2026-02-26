import { createAction, props } from '@ngrx/store';
import { Message } from '../../models/message.model';

export const loadMessages = createAction(
  '[Message] Load Messages',
  props<{ conversationId: number }>()
);

export const loadMessagesSuccess = createAction(
  '[Message] Load Messages Success',
  props<{ conversationId: number; messages: Message[] }>()
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
  props<{ message: Message }>()
);

export const sendMessageFailure = createAction(
  '[Message] Send Message Failure',
  props<{ error: any }>()
);

export const messageReceivedRealtime = createAction(
  '[Message] Realtime Message Received',
  props<{ message: Message }>()
);

export const setActiveConversation = createAction(
  '[Message] Set Active Conversation',
  props<{ conversationId: number | null }>()
);

export const clearMessages = createAction('[Message] Clear');
