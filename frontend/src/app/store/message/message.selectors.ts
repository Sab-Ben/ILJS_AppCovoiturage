import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MessageState } from './message.reducer';

export const selectMessageState = createFeatureSelector<MessageState>('message');

export const selectActiveConversationId = createSelector(
  selectMessageState,
  (state) => state.activeConversationId
);

export const selectMessageLoading = createSelector(
  selectMessageState,
  (state) => state.loading
);

export const selectMessagesForActiveConversation = createSelector(
  selectMessageState,
  (state) => {
    if (!state.activeConversationId) return [];
    return state.messagesByConversation[state.activeConversationId] ?? [];
  }
);
