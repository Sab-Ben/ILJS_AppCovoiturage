// message.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MessageService, SendMessageRequest } from './message.service';
import { environment } from '../../environments/environment';

describe('MessageService', () => {
  let service: MessageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(MessageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should get messages by conversation', () => {
    const conversationId = 10;
    const mockMessages = [{ id: 1, content: 'Bonjour' }];

    service.getMessages(conversationId).subscribe((res) => {
      expect(res.length).toBe(1);
      expect(res[0].content).toBe('Bonjour');
    });

    // L'URL doit correspondre EXACTEMENT à celle du service
    const req = httpMock.expectOne(`${environment.apiUrl}/messages/conversation/${conversationId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockMessages);
  });

  it('should send a message', () => {
    const payload: SendMessageRequest = { conversationId: 10, content: 'Salut' };
    const mockResponse = { id: 1, ...payload };

    service.sendMessage(payload).subscribe((res) => {
      expect(res.content).toBe('Salut');
      expect(res.id).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/messages`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('should mark conversation as read', () => {
    const conversationId = 10;

    service.markConversationAsRead(conversationId).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/messages/conversation/${conversationId}/read`);
    expect(req.request.method).toBe('PATCH');
    req.flush(null);
  });
});