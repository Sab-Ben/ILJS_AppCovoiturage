import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';
import { Role } from '../models/role.enum';

describe('UserService', () => {
    let service: UserService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                UserService,
                provideHttpClient(),
                provideHttpClientTesting()
            ]
        });
        service = TestBed.inject(UserService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('devrait récupérer le profil (GET)', () => {
        const dummyUser: User = { id: 1, firstname: 'Test', lastname: 'User', email: 'test@test.com', role: Role.CONDUCTEUR };

        service.getMyProfile().subscribe(user => {
            expect(user).toEqual(dummyUser);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
        expect(req.request.method).toBe('GET');
        req.flush(dummyUser);
    });

    it('devrait mettre à jour le profil (PUT)', () => {
        const updatedData: User = { id: 1, firstname: 'NewName', lastname: 'User', email: 'test@test.com', role: Role.PASSAGER };

        service.updateProfile(updatedData).subscribe(res => {
            expect(res).toBeTruthy();
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/users/me`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(updatedData);
        req.flush({ success: true });
    });
});