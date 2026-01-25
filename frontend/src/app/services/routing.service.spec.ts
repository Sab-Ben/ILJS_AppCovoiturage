import { TestBed } from '@angular/core/testing';
import { RoutingService } from './routing.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('RoutingService', () => {
  let service: RoutingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RoutingService]
    });
    service = TestBed.inject(RoutingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should calculate distance and duration correctly', () => {

    const coords = [[48.85, 2.35], [45.76, 4.83]];

    const dummyResponse = {
      routes: [{
        distance: 465000,
        duration: 16200
      }]
    };

    service.getRouteData(coords).subscribe(data => {
      expect(data.distanceKm).toBe(465);
      expect(data.duree).toBe('4h 30min');
    });

    const req = httpMock.expectOne(req => req.url.includes('router.project-osrm.org'));
    expect(req.request.method).toBe('GET');
    req.flush(dummyResponse);
  });
});