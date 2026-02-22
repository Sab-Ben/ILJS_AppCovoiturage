import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConversationService } from './conversation.service';
import { environment } from '../../environments/environment';

describe('ConversationService', () => {
  let service: ConversationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConversationService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ConversationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should open conversation', () => {
    const mock = { id: 1, trajetId: 2 } as any;

    service.openConversation(2).subscribe((res) => {
      expect(res.id).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/trajets/2/conversations`);
    expect(req.request.method).toBe('POST');
    req.flush(mock);
  });

  it('should get my conversations', () => {
    service.getMyConversations().subscribe((res) => {
      expect(res.length).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/conversations/me`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1 }]);
  });
});
