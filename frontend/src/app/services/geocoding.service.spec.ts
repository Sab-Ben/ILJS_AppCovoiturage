import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GeocodingService } from './geocoding.service';

describe('GeocodingService', () => {
  let service: GeocodingService;
  let httpMock: HttpTestingController;
  // URL de l'API Adresse
  const API_URL = 'https://api-adresse.data.gouv.fr/search/';

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

  // --- Tests pour getCoordinates ---

  it('should return coordinates [Lat, Lon] for a valid address', () => {
    const dummyAddress = 'Paris';

    // Structure GeoJSON renvoyée par l'API Adresse (BAN)
    // Note : L'API renvoie [Longitude, Latitude]
    const mockResponse = {
      features: [
        {
          geometry: {
            coordinates: [2.3522, 48.8566] // [Lon, Lat]
          },
          properties: {
            label: 'Paris'
          }
        }
      ]
    };

    service.getCoordinates(dummyAddress).subscribe(coords => {
      expect(coords).toBeTruthy();
      // On s'attend à ce que le service ait inversé pour donner [Lat, Lon]
      expect(coords).toEqual([48.8566, 2.3522]);
    });

    // On vérifie que l'appel part vers la bonne URL
    const req = httpMock.expectOne(req => req.url.includes('api-adresse.data.gouv.fr'));
    expect(req.request.method).toBe('GET');

    req.flush(mockResponse);
  });

  it('should return null if API returns no features', () => {
    const dummyAddress = 'Inconnu';
    const mockResponse = { features: [] }; // Réponse vide valide

    service.getCoordinates(dummyAddress).subscribe(coords => {
      expect(coords).toBeNull();
    });

    const req = httpMock.expectOne(req => req.url.includes('api-adresse.data.gouv.fr'));
    req.flush(mockResponse);
  });

  it('should return null immediately if input is empty', () => {
    service.getCoordinates('').subscribe(coords => {
      expect(coords).toBeNull();
    });

    httpMock.expectNone(req => req.url.includes('api-adresse.data.gouv.fr'));
  });

  // --- Tests pour searchAddresses (Autocomplétion) ---

  it('should return mapped addresses for autocomplete', () => {
    const query = '8 bd du port';

    const mockResponse = {
      features: [
        {
          properties: {
            label: '8 Boulevard du Port 80000 Amiens',
            context: '80, Somme, Hauts-de-France'
          },
          geometry: {
            coordinates: [2.29, 49.89]
          }
        }
      ]
    };

    service.searchAddresses(query).subscribe(results => {
      expect(results.length).toBe(1);
      expect(results[0].label).toBe('8 Boulevard du Port 80000 Amiens');
      expect(results[0].context).toBe('80, Somme, Hauts-de-France');
      // Vérification que les coordonnées originales sont conservées dans l'objet résultat
      expect(results[0].coords).toEqual([2.29, 49.89]);
    });

    const req = httpMock.expectOne(req => req.url.includes('api-adresse.data.gouv.fr'));
    req.flush(mockResponse);
  });

  it('should return empty array if query is too short (< 3 chars)', () => {
    service.searchAddresses('Pa').subscribe(results => {
      expect(results).toEqual([]);
    });

    httpMock.expectNone(req => req.url.includes('api-adresse.data.gouv.fr'));
  });
});