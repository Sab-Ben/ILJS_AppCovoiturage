// conversation.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConversationService } from './conversation.service';
import { environment } from '../../environments/environment';

describe('ConversationService', () => {
  let service: ConversationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConversationService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ConversationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Vérifie qu'il n'y a pas de requêtes HTTP non gérées
  });

  it('should create or get a conversation', () => {
    const mockConversationId = 123;
    const trajetId = 1;
    const otherUserId = 45;

    service.createOrGetConversation(trajetId, otherUserId).subscribe((id) => {
      expect(id).toBe(mockConversationId);
    });

    // On attend l'URL définie dans le service avec les query params
    const req = httpMock.expectOne(request =>
        request.url === `${environment.apiUrl}/conversations` &&
        request.params.get('trajetId') === '1' &&
        request.params.get('otherUserId') === '45'
    );

    expect(req.request.method).toBe('POST');
    req.flush(mockConversationId);
  });

  it('should get my conversations', () => {
    const mockData = [{ id: 1 }, { id: 2 }] as any;

    service.getMyConversations().subscribe((res) => {
      expect(res.length).toBe(2);
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/conversations/me`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});