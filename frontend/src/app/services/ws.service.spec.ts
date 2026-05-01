import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WsService } from './ws.service';
import { AuthService } from './auth.service';

describe('WsService', () => {
  let service: WsService;

  const authServiceMock = {
    getToken: vi.fn().mockReturnValue('fake-token')
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WsService,
        { provide: AuthService, useValue: authServiceMock },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    service = TestBed.inject(WsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false by default for isConnected()', () => {
    expect(service.isConnected()).toBe(false);
  });

  it('should return null when subscribing to conversation if not connected', () => {
    const sub = service.subscribeToConversation(1, vi.fn());
    expect(sub).toBeNull();
  });

  it('should return null when subscribing to notifications if not connected', () => {
    const sub = service.subscribeToUserNotifications(1, vi.fn());
    expect(sub).toBeNull();
  });

  it('disconnect should not throw', () => {
    expect(() => service.disconnect()).not.toThrow();
    expect(service.isConnected()).toBe(false);
  });
});
