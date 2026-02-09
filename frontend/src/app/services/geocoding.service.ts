import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class GeocodingService {
    private nominatimUrl = 'https://nominatim.openstreetmap.org/search';

    constructor(private http: HttpClient) {}

    searchAddresses(query: string): Observable<any[]> {
        if (!query || query.length < 3) return of([]);

        const params = {
            q: query,
            format: 'json',
            addressdetails: '1',
            limit: '10',
            countrycodes: 'fr',
            layer: 'address'
        };

        return this.http.get<any[]>(this.nominatimUrl, { params }).pipe(
            map(results => {
                return results.map(result => ({
                    ...result,
                    label: this.formatLabel(result)
                }));
            })
        );
    }

    getCoordinates(address: string): Observable<[number, number] | null> {
        if (!address) return of(null);

        const params = {
            q: address,
            format: 'json',
            limit: '1',
            countrycodes: 'fr'
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

    private formatLabel(result: any): string {
        const addr = result.address;

        const number = addr.house_number || '';
        const street = addr.road || addr.pedestrian || addr.street || addr.hamlet || '';
        const city = addr.city || addr.town || addr.village || addr.municipality || '';
        const postcode = addr.postcode || '';

        // Si pas de rue ni ville, on garde le nom par défaut
        if (!street && !city) return result.display_name;

        let part1 = '';
        if (number) part1 += `${number} `;
        if (street) part1 += street;

        let part2 = '';
        if (postcode) part2 += `${postcode} `;
        if (city) part2 += city;

        if (part1 && part2) return `${part1}, ${part2}`;
        if (part1) return part1;
        return part2;
    }
}