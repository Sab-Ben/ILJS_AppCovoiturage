// frontend/src/app/store/offline/offline.actions.ts
import { createAction, props } from '@ngrx/store';

export const actionQueuedOffline = createAction(
    '[Offline] Action Queued',
    props<{ action: any }>()
);

export const startSync = createAction('[Offline] Start Sync');