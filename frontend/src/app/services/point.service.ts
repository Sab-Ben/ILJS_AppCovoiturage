import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PointBalance } from '../models/point-balance.model';
import { PointTransaction } from '../models/point-transaction.model';

@Injectable({
    providedIn: 'root'
})
export class PointService {

    private readonly apiUrl = `${environment.apiUrl}/points`;

    constructor(private http: HttpClient) {}

    getBalance(): Observable<PointBalance> {
        return this.http.get<PointBalance>(`${this.apiUrl}/balance`);
    }

    getHistory(): Observable<PointTransaction[]> {
        return this.http.get<PointTransaction[]>(`${this.apiUrl}/history`);
    }

    testCompletion(): Observable<Record<string, unknown>> {
        return this.http.post<Record<string, unknown>>(`${this.apiUrl}/test-completion`, {});
    }

    debugTrajets(): Observable<Record<string, unknown>[]> {
        return this.http.get<Record<string, unknown>[]>(`${this.apiUrl}/debug-trajets`);
    }
}
