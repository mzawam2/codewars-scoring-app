import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { take } from 'rxjs';
import { AppComponent } from './app.component';

describe('AppComponent + UserService (integration)', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should integrate API pages + challenge details into scored rows', (done) => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance as any;

    component.teamsSubject.next([
      { teamMembers: ['A', 'B'], codeWarsUser: 'css99', completedKatas: [], points: 0 }
    ]);

    component.scoreBoardItems$.pipe(take(1)).subscribe((items: any[]) => {
      expect(items.length).toBe(1);
      expect(items[0].points).toBe(200);
      expect(items[0].completedKatas).toEqual(['Reversed Strings']);
      expect(items[0].rank).toBe(1);
      done();
    });

    const listReq = httpMock.expectOne('https://www.codewars.com/api/v1/users/css99/code-challenges/completed?page=0');
    listReq.flush({
      totalPages: 1,
      totalItems: 1,
      data: [
        {
          id: '5168bb5dfe9a00b126000018',
          name: 'Reversed Strings',
          slug: '5168bb5dfe9a00b126000018',
          completedLanguages: ['javascript'],
          completedAt: '2025-04-11T12:00:00.000Z'
        }
      ]
    });

    const challengeReq = httpMock.expectOne('https://www.codewars.com/api/v1/code-challenges/5168bb5dfe9a00b126000018');
    challengeReq.flush({
      id: '5168bb5dfe9a00b126000018',
      name: 'Reversed Strings',
      slug: '5168bb5dfe9a00b126000018',
      url: 'https://www.codewars.com/kata/5168bb5dfe9a00b126000018',
      category: 'algorithms',
      description: 'x',
      tags: [],
      languages: ['javascript'],
      rank: { id: -1, name: '1 kyu', color: 'yellow' },
      createdBy: { username: 'u', url: 'u' },
      approvedBy: { username: 'a', url: 'a' },
      totalAttempts: 1,
      totalCompleted: 1,
      totalStars: 1,
      voteScore: 1,
      publishedAt: '2025-01-01T00:00:00.000Z',
      approvedAt: '2025-01-01T00:00:00.000Z'
    });
  });

  it('should keep scoreboard alive if one team request fails', (done) => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance as any;

    component.teamsSubject.next([
      { teamMembers: ['Good'], codeWarsUser: 'good-user', completedKatas: [], points: 0 },
      { teamMembers: ['Bad'], codeWarsUser: 'bad-user', completedKatas: [], points: 0 }
    ]);

    component.scoreBoardItems$.pipe(take(1)).subscribe((items: any[]) => {
      expect(items.length).toBe(2);

      const good = items.find(i => i.codeWarsUser === 'good-user');
      const bad = items.find(i => i.codeWarsUser === 'bad-user');

      expect(good?.points).toBe(200);
      expect(bad?.points).toBe(0);
      done();
    });

    const goodListReq = httpMock.expectOne('https://www.codewars.com/api/v1/users/good-user/code-challenges/completed?page=0');
    const badListReq = httpMock.expectOne('https://www.codewars.com/api/v1/users/bad-user/code-challenges/completed?page=0');

    badListReq.flush('Not Found', { status: 404, statusText: 'Not Found' });

    goodListReq.flush({
      totalPages: 1,
      totalItems: 1,
      data: [
        {
          id: '514b92a657cdc65150000006',
          name: 'Multiples of 3 or 5',
          slug: '514b92a657cdc65150000006',
          completedLanguages: ['javascript'],
          completedAt: '2025-04-11T12:00:00.000Z'
        }
      ]
    });

    const challengeReq = httpMock.expectOne('https://www.codewars.com/api/v1/code-challenges/514b92a657cdc65150000006');
    challengeReq.flush({
      id: '514b92a657cdc65150000006',
      name: 'Multiples of 3 or 5',
      slug: '514b92a657cdc65150000006',
      url: 'https://www.codewars.com/kata/514b92a657cdc65150000006',
      category: 'algorithms',
      description: 'x',
      tags: [],
      languages: ['javascript'],
      rank: { id: -1, name: '1 kyu', color: 'yellow' },
      createdBy: { username: 'u', url: 'u' },
      approvedBy: { username: 'a', url: 'a' },
      totalAttempts: 1,
      totalCompleted: 1,
      totalStars: 1,
      voteScore: 1,
      publishedAt: '2025-01-01T00:00:00.000Z',
      approvedAt: '2025-01-01T00:00:00.000Z'
    });
  });
});
