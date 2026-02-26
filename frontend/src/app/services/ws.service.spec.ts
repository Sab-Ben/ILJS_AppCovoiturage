import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WsService } from './ws.service';
import { Store } from '@ngrx/store';

const activateSpy = vi.fn();
const deactivateSpy = vi.fn();
const subscribeSpy = vi.fn().mockReturnValue({ unsubscribe: vi.fn() });
let lastClientConfig: any;

vi.mock('@stomp/stompjs', () => ({
    Client: class {
        activate = activateSpy;
        deactivate = deactivateSpy;
        subscribe = subscribeSpy;
        active = false;
        constructor(config: any) { lastClientConfig = config; }
    }
}));

vi.mock('sockjs-client', () => ({
    default: vi.fn().mockImplementation(() => ({ close: vi.fn() }))
}));

describe('WsService', () => {
    let service: WsService;
    let storeMock: any;

    beforeEach(() => {
        storeMock = { dispatch: vi.fn() };
        lastClientConfig = null;
        TestBed.configureTestingModule({
            providers: [WsService, { provide: Store, useValue: storeMock }]
        });
        service = TestBed.inject(WsService);
        vi.clearAllMocks();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should activate client and subscribe onConnect', () => {
        service.connect('token');
        expect(activateSpy).toHaveBeenCalled();

        // Simule la connexion réussie
        if (lastClientConfig?.onConnect) lastClientConfig.onConnect();

        expect(subscribeSpy).toHaveBeenCalledWith('/user/queue/events', expect.any(Function));
    });

    it('should dispatch actions when a message is handled', () => {
        const mockMsg = {
            body: JSON.stringify({
                type: 'NOTIFICATION',
                payload: { id: 1, content: 'Test' }
            })
        };

        // On utilise ["handleIncoming"] pour éviter les erreurs de type sur le private
        (service as any)["handleIncoming"](mockMsg);

        expect(storeMock.dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: '[Notification] Realtime Received'
            })
        );
    });

    it('should clean up on disconnect', () => {
        const mockUnsub = vi.fn();
        (service as any).userEventsSub = { unsubscribe: mockUnsub };
        (service as any).client = { deactivate: deactivateSpy, active: true };

        service.disconnect();

        expect(mockUnsub).toHaveBeenCalled();
        expect(deactivateSpy).toHaveBeenCalled();
    });
});