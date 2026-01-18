import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GeocodingService } from './geocoding.service';

describe('GeocodingService', () => {
  let service: GeocodingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GeocodingService]
    });
    service = TestBed.inject(GeocodingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return coordinates for a valid city', () => {
    const dummyCity = 'Paris';
    // Réponse simulée de l'API Nominatim
    const mockResponse = [
      {
        place_id: 123,
        lat: '48.8566',
        lon: '2.3522',
        display_name: 'Paris, France'
      }
    ];

    service.getCoordinates(dummyCity).subscribe(coords => {
      expect(coords).toBeTruthy();
      expect(coords).toEqual([48.8566, 2.3522]);
    });

    const req = httpMock.expectOne(req => req.url.includes('nominatim.openstreetmap.org'));
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('q')).toBe(dummyCity);

    req.flush(mockResponse);
  });

  it('should return null if no results found', () => {
    const dummyCity = 'VilleInconnue';

    service.getCoordinates(dummyCity).subscribe(coords => {
      expect(coords).toBeNull();
    });

    const req = httpMock.expectOne(req => req.url.includes('nominatim.openstreetmap.org'));
    req.flush([]); // Tableau vide renvoyé par l'API
  });

  it('should return null immediately if input is empty', () => {
    service.getCoordinates('').subscribe(coords => {
      expect(coords).toBeNull();
    });

    httpMock.expectNone(req => req.url.includes('nominatim.openstreetmap.org'));
  });
});