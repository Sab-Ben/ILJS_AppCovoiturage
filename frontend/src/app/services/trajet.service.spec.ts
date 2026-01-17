import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TrajetService } from './trajet.service';
import { Trajet } from '../models/trajet.model';
import { environment } from '../../environments/environment';

describe('TrajetService', () => {
    let service: TrajetService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [TrajetService]
        });
        service = TestBed.inject(TrajetService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create a trajet via POST', () => {
        const dummyTrajet: Trajet = {
            villeDepart: 'Paris',
            villeArrivee: 'Lyon',
            dateHeureDepart: '2025-05-01T10:00:00',
            placesDisponibles: 3
        };

        service.createTrajet(dummyTrajet).subscribe(trajet => {
            expect(trajet).toEqual(dummyTrajet);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/trajets`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(dummyTrajet);
        req.flush(dummyTrajet);
    });

});