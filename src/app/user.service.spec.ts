import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UserService } from './user.service';
import { CODEWARS_API_CONFIG } from './config/api.config';

describe('UserService (unit)', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call completed challenges endpoint for user and page', () => {
    service.getCodeChallengesByUser('css99', 0).subscribe();

    const req = httpMock.expectOne(`${CODEWARS_API_CONFIG.baseUrl}/users/css99/code-challenges/completed?page=0`);
    expect(req.request.method).toBe('GET');
    req.flush({ totalPages: 1, totalItems: 0, data: [] });
  });

  it('should call challenge detail endpoint by id', () => {
    service.getCodeChallenge('kata-1').subscribe();

    const req = httpMock.expectOne(`${CODEWARS_API_CONFIG.baseUrl}/code-challenges/kata-1`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
