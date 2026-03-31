import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UserService } from './user.service';
import { CODEWARS_API_CONFIG } from './config/api.config';
import { DataModeService } from './services/data-mode.service';

describe('UserService (unit)', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let dataModeServiceStub: { isMockMode: jasmine.Spy };

  beforeEach(() => {
    dataModeServiceStub = {
      isMockMode: jasmine.createSpy('isMockMode').and.returnValue(false)
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DataModeService, useValue: dataModeServiceStub }
      ]
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

  it('should return paged mock completed challenges in mock mode', () => {
    dataModeServiceStub.isMockMode.and.returnValue(true);

    service.getCodeChallengesByUser('css99', 0).subscribe((result) => {
      expect(result.totalItems).toBeGreaterThan(0);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.length).toBeLessThanOrEqual(10);
    });
  });

  it('should return live endpoint when mock mode user is not in team config', () => {
    dataModeServiceStub.isMockMode.and.returnValue(true);

    service.getCodeChallengesByUser('unknown-user', 0).subscribe();

    const req = httpMock.expectOne(`${CODEWARS_API_CONFIG.baseUrl}/users/unknown-user/code-challenges/completed?page=0`);
    expect(req.request.method).toBe('GET');
    req.flush({ totalPages: 1, totalItems: 0, data: [] });
  });

  it('should call challenge detail endpoint by id', () => {
    service.getCodeChallenge('kata-1').subscribe();

    const req = httpMock.expectOne(`${CODEWARS_API_CONFIG.baseUrl}/code-challenges/kata-1`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should return mock challenge detail in mock mode when available', () => {
    dataModeServiceStub.isMockMode.and.returnValue(true);

    service.getCodeChallenge('5168bb5dfe9a00b126000018').subscribe((result) => {
      expect(result.id).toBe('5168bb5dfe9a00b126000018');
      expect(result.name).toBeTruthy();
    });
  });

  it('should fall back to live challenge endpoint in mock mode when detail is unavailable', () => {
    dataModeServiceStub.isMockMode.and.returnValue(true);

    service.getCodeChallenge('missing-kata').subscribe();

    const req = httpMock.expectOne(`${CODEWARS_API_CONFIG.baseUrl}/code-challenges/missing-kata`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
