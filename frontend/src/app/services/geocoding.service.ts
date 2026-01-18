import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private nominatimUrl = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) {}

  getCoordinates(city: string): Observable<[number, number] | null> {
    if (!city) return of(null);

    const params = {
      q: city,
      format: 'json',
      limit: '1'
    };

    return this.http.get<any[]>(this.nominatimUrl, { params }).pipe(
        map(results => {
          if (results && results.length > 0) {
            return [parseFloat(results[0].lat), parseFloat(results[0].lon)];
          }
          return null;
        })
    );
  }
}