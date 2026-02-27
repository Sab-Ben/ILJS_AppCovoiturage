import {TestBed} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

import {ReservationService} from './reservation.service';
import {environment} from '../../environments/environment';
import {CreateReservationRequest, ReservationStatus} from '../models/reservation.model';

describe('ReservationService', () => {
    let service: ReservationService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ReservationService,
                provideHttpClient(), // Configuration moderne
                provideHttpClientTesting() // Configuration moderne pour le mock
            ]
        });

        service = TestBed.inject(ReservationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        // On vérifie que httpMock existe avant de vérifier les requêtes
        if (httpMock) {
            httpMock.verify();
        }
    });

    it('devrait être créé', () => {
        expect(service).toBeTruthy();
    });

    describe('createReservation', () => {
        it('devrait envoyer une requête POST pour créer une réservation', () => {
            const mockPayload: CreateReservationRequest = {rideId: 1, seats: 2, desiredRoute: 'Paris - Lyon'};
            const mockResponse = {id: 100, seats: 2, status: 'RESERVED'} as any;

            service.createReservation(mockPayload).subscribe((res) => {
                expect(res).toEqual(mockResponse);
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/reservations`);
            expect(req.request.method).toBe('POST');
            req.flush(mockResponse);
        });
    });

    describe('getMyReservations', () => {
        it('devrait envoyer une requête GET avec le bon paramètre de statut', () => {
            const mockStatus: ReservationStatus = 'RESERVED';

            service.getMyReservations(mockStatus).subscribe();

            // Vérifie l'URL complète avec les query params
            const req = httpMock.expectOne(req =>
                req.url === `${environment.apiUrl}/reservations/me` &&
                req.params.get('status') === mockStatus
            );

            expect(req.request.method).toBe('GET');
            req.flush([]);
        });
    });
});