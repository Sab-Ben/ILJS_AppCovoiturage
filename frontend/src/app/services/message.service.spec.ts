import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MessageService } from './message.service';
import { environment } from '../../environments/environment';

describe('MessageService', () => {
  let service: MessageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MessageService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(MessageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should get messages by conversation', () => {
    service.getMessages(10).subscribe((res) => {
      expect(res.length).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/conversations/10/messages`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, content: 'Bonjour' }]);
  });

  it('should send a message', () => {
    service.sendMessage(10, { content: 'Salut' }).subscribe((res) => {
      expect(res.content).toBe('Salut');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/conversations/10/messages`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ content: 'Salut' });
    req.flush({ id: 1, content: 'Salut' });
  });
});
