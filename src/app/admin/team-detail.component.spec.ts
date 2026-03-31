import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';

import { TeamDetailComponent } from './team-detail.component';
import { UserService } from '../user.service';

describe('TeamDetailComponent (unit)', () => {
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj<UserService>('UserService', [
      'getCodeChallengesByUser',
      'getCodeChallenge',
    ]);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [TeamDetailComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { params: { teamIndex: '2' } } } },
      ],
    }).compileComponents();
  });

  it('should create and load contest-eligible rows with difficulty/points', () => {
    userServiceSpy.getCodeChallengesByUser.and.returnValue(
      of({
        totalPages: 1,
        totalItems: 3,
        data: [
          {
            id: '5168bb5dfe9a00b126000018',
            name: 'Reversed Strings',
            slug: '5168bb5dfe9a00b126000018',
            completedLanguages: ['javascript'],
            completedAt: '2025-04-11T02:00:00.000Z' as any,
          },
          {
            id: '5168bb5dfe9a00b126000018',
            name: 'Reversed Strings',
            slug: '5168bb5dfe9a00b126000018',
            completedLanguages: ['ruby'],
            completedAt: '2025-04-11T03:00:00.000Z' as any,
          },
          {
            id: '5168bb5dfe9a00b126000018',
            name: 'Reversed Strings',
            slug: '5168bb5dfe9a00b126000018',
            completedLanguages: ['javascript'],
            completedAt: '2025-04-12T02:00:00.000Z' as any,
          },
        ],
      })
    );

    userServiceSpy.getCodeChallenge.and.returnValue(
      of({
        id: '5168bb5dfe9a00b126000018',
        name: 'Reversed Strings',
        slug: '5168bb5dfe9a00b126000018',
        url: 'https://www.codewars.com/kata/5168bb5dfe9a00b126000018',
        category: 'reference',
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
        approvedAt: '2025-01-01T00:00:00.000Z',
      })
    );

    const fixture = TestBed.createComponent(TeamDetailComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.error).toBe('');
    expect(component.katas.length).toBe(1);
    expect(component.katas[0].difficulty).toBe('1 kyu');
    expect(component.katas[0].points).toBe(200);
    expect(component.totalPoints).toBe(200);
  });

  it('should set error when team index is invalid', async () => {
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TeamDetailComponent],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { params: { teamIndex: '999' } } } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TeamDetailComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.error).toBe('Team not found');
    expect(component.loading).toBeFalse();
  });

  it('should handle user challenge page fetch errors', () => {
    userServiceSpy.getCodeChallengesByUser.and.returnValue(throwError(() => new Error('boom')));

    const fixture = TestBed.createComponent(TeamDetailComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.error).toBe('Failed to load completed katas');
    expect(component.loading).toBeFalse();
  });

  it('should navigate back to admin', () => {
    const fixture = TestBed.createComponent(TeamDetailComponent);
    const component = fixture.componentInstance;

    component.goBack();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('should fetch multiple pages recursively', () => {
    userServiceSpy.getCodeChallengesByUser.and.callFake((_, page: number) => {
      if (page === 0) {
        return of({
          totalPages: 2,
          totalItems: 2,
          data: [
            {
              id: '5168bb5dfe9a00b126000018',
              name: 'Reversed Strings',
              slug: '5168bb5dfe9a00b126000018',
              completedLanguages: ['javascript'],
              completedAt: '2025-04-11T02:00:00.000Z' as any,
            },
          ],
        });
      }

      return of({
        totalPages: 2,
        totalItems: 2,
        data: [
          {
            id: '514b92a657cdc65150000006',
            name: 'Multiples of 3 or 5',
            slug: '514b92a657cdc65150000006',
            completedLanguages: ['java'],
            completedAt: '2025-04-11T03:00:00.000Z' as any,
          },
        ],
      });
    });

    userServiceSpy.getCodeChallenge.and.callFake((id: string) =>
      of({
        id,
        name: id === '514b92a657cdc65150000006' ? 'Multiples of 3 or 5' : 'Reversed Strings',
        slug: id,
        url: `https://www.codewars.com/kata/${id}`,
        category: 'algorithms',
        description: 'x',
        tags: [],
        languages: ['javascript'],
        rank: { id: -8, name: '8 kyu', color: 'white' },
        createdBy: { username: 'u', url: 'u' },
        approvedBy: { username: 'a', url: 'a' },
        totalAttempts: 1,
        totalCompleted: 1,
        totalStars: 1,
        voteScore: 1,
        publishedAt: '2025-01-01T00:00:00.000Z',
        approvedAt: '2025-01-01T00:00:00.000Z',
      })
    );

    const fixture = TestBed.createComponent(TeamDetailComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(userServiceSpy.getCodeChallengesByUser).toHaveBeenCalledTimes(2);
    expect(component.katas.length).toBe(2);
  });

  it('should use fallback N/A difficulty and 0 points when detail lookup fails', () => {
    userServiceSpy.getCodeChallengesByUser.and.returnValue(
      of({
        totalPages: 1,
        totalItems: 1,
        data: [
          {
            id: '5168bb5dfe9a00b126000018',
            name: 'Reversed Strings',
            slug: '5168bb5dfe9a00b126000018',
            completedLanguages: ['javascript'],
            completedAt: '2025-04-11T02:00:00.000Z' as any,
          },
        ],
      })
    );

    userServiceSpy.getCodeChallenge.and.returnValue(throwError(() => new Error('detail fail')));

    const fixture = TestBed.createComponent(TeamDetailComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.katas[0].difficulty).toBe('N/A');
    expect(component.katas[0].points).toBe(0);
  });

  it('should support sorting by name/difficulty/points and indicators', () => {
    userServiceSpy.getCodeChallengesByUser.and.returnValue(of({ totalPages: 1, totalItems: 0, data: [] }));

    const fixture = TestBed.createComponent(TeamDetailComponent);
    const component = fixture.componentInstance as any;

    component.katas = [
      {
        id: 'b',
        name: 'Beta',
        slug: 'b',
        completedLanguages: ['javascript'],
        completedAt: '2025-04-11T02:00:00.000Z',
        difficulty: '8 kyu',
        difficultyRank: 8,
        points: 5,
      },
      {
        id: 'a',
        name: 'Alpha',
        slug: 'a',
        completedLanguages: ['java'],
        completedAt: '2025-04-11T03:00:00.000Z',
        difficulty: '1 kyu',
        difficultyRank: 1,
        points: 200,
      },
    ];

    component.sort('name');
    expect(component.filteredKatas[0].name).toBe('Alpha');

    component.sort('difficulty');
    expect(component.filteredKatas[0].difficultyRank).toBe(1);

    component.sort('points');
    expect(component.filteredKatas[0].points).toBe(5);
    component.sort('points');
    expect(component.filteredKatas[0].points).toBe(200);

    expect(component.getSortIndicator('points')).toContain('▼');
    expect(component.getSortIndicator('name')).toBe('');
    expect(component.totalPoints).toBe(205);
  });

  it('should safely handle unknown sort field default path', () => {
    userServiceSpy.getCodeChallengesByUser.and.returnValue(of({ totalPages: 1, totalItems: 0, data: [] }));
    const fixture = TestBed.createComponent(TeamDetailComponent);
    const component = fixture.componentInstance as any;

    component.katas = [
      {
        id: 'x',
        name: 'X',
        slug: 'x',
        completedLanguages: ['javascript'],
        completedAt: '2025-04-11T02:00:00.000Z',
        difficulty: '8 kyu',
        difficultyRank: 8,
        points: 5,
      },
    ];

    component.sortField = 'unknown';
    expect(() => component.applySort()).not.toThrow();
  });

  it('should unsubscribe on destroy', () => {
    userServiceSpy.getCodeChallengesByUser.and.returnValue(of({ totalPages: 1, totalItems: 0, data: [] }));
    const fixture = TestBed.createComponent(TeamDetailComponent);
    const component = fixture.componentInstance as any;
    const unsubscribeSpy = spyOn(component.subscriptions, 'unsubscribe');

    component.ngOnDestroy();

    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should return empty list when enriching no challenges', async () => {
    userServiceSpy.getCodeChallengesByUser.and.returnValue(of({ totalPages: 1, totalItems: 0, data: [] }));
    const fixture = TestBed.createComponent(TeamDetailComponent);
    const component = fixture.componentInstance as any;

    const result = await firstValueFrom(component.enrichWithDifficultyAndPoints([]));
    expect(result).toEqual([]);
  });

  it('should handle missing rank values when enriching details', () => {
    userServiceSpy.getCodeChallengesByUser.and.returnValue(
      of({
        totalPages: 1,
        totalItems: 1,
        data: [
          {
            id: '5168bb5dfe9a00b126000018',
            name: 'Reversed Strings',
            slug: '5168bb5dfe9a00b126000018',
            completedLanguages: ['javascript'],
            completedAt: '2025-04-11T02:00:00.000Z' as any,
          },
        ],
      })
    );

    userServiceSpy.getCodeChallenge.and.returnValue(
      of({
        id: '5168bb5dfe9a00b126000018',
        name: 'Reversed Strings',
        slug: '5168bb5dfe9a00b126000018',
        url: 'https://www.codewars.com/kata/5168bb5dfe9a00b126000018',
        category: 'reference',
        description: 'x',
        tags: [],
        languages: ['javascript'],
        rank: undefined as any,
        createdBy: { username: 'u', url: 'u' },
        approvedBy: { username: 'a', url: 'a' },
        totalAttempts: 1,
        totalCompleted: 1,
        totalStars: 1,
        voteScore: 1,
        publishedAt: '2025-01-01T00:00:00.000Z',
        approvedAt: '2025-01-01T00:00:00.000Z',
      })
    );

    const fixture = TestBed.createComponent(TeamDetailComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.katas[0].difficulty).toBe('N/A');
    expect(component.katas[0].difficultyRank).toBe(Number.MAX_SAFE_INTEGER);
    expect(component.katas[0].points).toBe(0);
  });

  it('should accept kata by slug fallback when id is unknown', () => {
    userServiceSpy.getCodeChallengesByUser.and.returnValue(
      of({
        totalPages: 1,
        totalItems: 1,
        data: [
          {
            id: 'unknown-id',
            name: 'Reversed Strings',
            slug: '5168bb5dfe9a00b126000018',
            completedLanguages: ['javascript'],
            completedAt: '2025-04-11T02:00:00.000Z' as any,
          },
        ],
      })
    );

    userServiceSpy.getCodeChallenge.and.returnValue(
      of({
        id: 'unknown-id',
        name: 'Reversed Strings',
        slug: '5168bb5dfe9a00b126000018',
        url: 'https://www.codewars.com/kata/5168bb5dfe9a00b126000018',
        category: 'reference',
        description: 'x',
        tags: [],
        languages: ['javascript'],
        rank: { id: -8, name: '8 kyu', color: 'white' },
        createdBy: { username: 'u', url: 'u' },
        approvedBy: { username: 'a', url: 'a' },
        totalAttempts: 1,
        totalCompleted: 1,
        totalStars: 1,
        voteScore: 1,
        publishedAt: '2025-01-01T00:00:00.000Z',
        approvedAt: '2025-01-01T00:00:00.000Z',
      })
    );

    const fixture = TestBed.createComponent(TeamDetailComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.katas.length).toBe(1);
  });

  it('should cover sort toggles and equal-comparison/default branches', () => {
    userServiceSpy.getCodeChallengesByUser.and.returnValue(of({ totalPages: 1, totalItems: 0, data: [] }));
    const fixture = TestBed.createComponent(TeamDetailComponent);
    const component = fixture.componentInstance as any;

    component.katas = [
      {
        id: 'x', name: 'Same', slug: 'x', completedLanguages: ['javascript'], completedAt: '2025-04-11T01:00:00.000Z',
        difficulty: '8 kyu', difficultyRank: 8, points: 5,
      },
      {
        id: 'y', name: 'Same', slug: 'y', completedLanguages: ['javascript'], completedAt: '2025-04-11T01:00:00.000Z',
        difficulty: '8 kyu', difficultyRank: 8, points: 5,
      },
    ];

    component.sortField = 'name';
    component.sortDirection = 'desc';
    component.sort('name'); // desc -> asc branch
    expect(component.sortDirection).toBe('asc');
    expect(component.getSortIndicator('name')).toBe(' ▲');

    component.sortField = 'points';
    component.sortDirection = 'asc';
    component.sort('completedAt'); // field change to completedAt -> desc branch
    expect(component.sortDirection).toBe('desc');

    component.sortField = 'unknown';
    expect(() => component.applySort()).not.toThrow();
  });
});
