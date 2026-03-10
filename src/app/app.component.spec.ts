import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { AppComponent } from './app.component';
import { UserService } from './user.service';
import { CodeChallengeResponse } from './code-challenge-response';
import { SCOREBOARD_RUNTIME_CONFIG } from './config/runtime.config';
import { ScoreBoardItem } from './score-board-item';

describe('AppComponent (unit)', () => {
  let component: AppComponent;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  const acceptedChallenge: CodeChallengeResponse = {
    id: 'accepted-1',
    name: 'Nut Farm',
    slug: 'nut-farm',
    url: 'https://www.codewars.com/kata/nut-farm',
    category: 'algorithms',
    description: 'desc',
    tags: [],
    languages: ['javascript'],
    rank: { id: -1, name: '1 kyu', color: 'yellow' },
    createdBy: { username: 'u1', url: 'x' },
    approvedBy: { username: 'u2', url: 'y' },
    totalAttempts: 1,
    totalCompleted: 1,
    totalStars: 1,
    voteScore: 1,
    publishedAt: '2025-01-01T00:00:00Z',
    approvedAt: '2025-01-01T00:00:00Z'
  };

  const nonAcceptedChallenge: CodeChallengeResponse = {
    ...acceptedChallenge,
    id: 'not-accepted-1',
    name: 'Some Other Kata',
    slug: 'some-other-kata',
    rank: { id: -4, name: '4 kyu', color: 'blue' }
  };

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj<UserService>('UserService', ['getCodeChallengesByUser', 'getCodeChallenge']);

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: UserService, useValue: userServiceSpy }]
    }).compileComponents();

    component = TestBed.createComponent(AppComponent).componentInstance;
    localStorage.clear();
  });

  it('should create and expose configured title', () => {
    expect(component).toBeTruthy();
    expect(component.title).toBe('Hackathon ScoreBoard');
  });

  it('should return cached challenge without service call', async () => {
    localStorage.setItem(
      SCOREBOARD_RUNTIME_CONFIG.challengeCacheKey,
      JSON.stringify({ [acceptedChallenge.id]: acceptedChallenge })
    );

    const result = await firstValueFrom((component as any).getCachedChallenge(acceptedChallenge.id));

    expect(result).toEqual(acceptedChallenge);
    expect(userServiceSpy.getCodeChallenge).not.toHaveBeenCalled();
  });

  it('should fetch and cache challenge on cache miss', async () => {
    userServiceSpy.getCodeChallenge.and.returnValue(of(acceptedChallenge));

    const result = await firstValueFrom((component as any).getCachedChallenge(acceptedChallenge.id));
    const cache = JSON.parse(localStorage.getItem(SCOREBOARD_RUNTIME_CONFIG.challengeCacheKey) || '{}');

    expect(result).toEqual(acceptedChallenge);
    expect(userServiceSpy.getCodeChallenge).toHaveBeenCalledWith(acceptedChallenge.id);
    expect(cache[acceptedChallenge.id].name).toBe('Nut Farm');
  });

  it('should score only accepted katas completed within event window', async () => {
    const team = {
      teamMembers: ['A', 'B'],
      codeWarsUser: 'team-user',
      completedKatas: [],
      points: 0
    };

    userServiceSpy.getCodeChallengesByUser.and.returnValue(
      of({
        totalPages: 1,
        totalItems: 3,
        data: [
          {
            id: 'accepted-1',
            name: 'Nut Farm',
            slug: 'nut-farm',
            completedLanguages: ['javascript'],
            completedAt: '2025-04-11T01:00:00.000Z' as any
          },
          {
            id: 'not-accepted-1',
            name: 'Some Other Kata',
            slug: 'some-other-kata',
            completedLanguages: ['javascript'],
            completedAt: '2025-04-11T01:10:00.000Z' as any
          },
          {
            id: 'out-of-window',
            name: 'Nut Farm',
            slug: 'nut-farm',
            completedLanguages: ['javascript'],
            completedAt: '2025-04-12T00:30:00.000Z' as any
          }
        ]
      })
    );

    userServiceSpy.getCodeChallenge.and.callFake((id: string) => {
      if (id === 'accepted-1') {
        return of(acceptedChallenge);
      }
      if (id === 'not-accepted-1') {
        return of(nonAcceptedChallenge);
      }
      return of(acceptedChallenge);
    });

    const result = await firstValueFrom((component as any).loadTeamData(team)) as ScoreBoardItem;

    expect(result.points).toBe(200);
    expect(result.completedKatas).toEqual(['Nut Farm']);
  });

  it('should not score accepted katas completed only in non-accepted languages', async () => {
    const team = {
      teamMembers: ['A', 'B'],
      codeWarsUser: 'team-user',
      completedKatas: [],
      points: 0
    };

    userServiceSpy.getCodeChallengesByUser.and.returnValue(
      of({
        totalPages: 1,
        totalItems: 1,
        data: [
          {
            id: 'accepted-1',
            name: 'Nut Farm',
            slug: 'nut-farm',
            completedLanguages: ['ruby'],
            completedAt: '2025-04-11T01:00:00.000Z' as any
          }
        ]
      })
    );

    userServiceSpy.getCodeChallenge.and.returnValue(of(acceptedChallenge));

    const result = await firstValueFrom((component as any).loadTeamData(team)) as ScoreBoardItem;

    expect(userServiceSpy.getCodeChallenge).not.toHaveBeenCalled();
    expect(result.points).toBe(0);
    expect(result.completedKatas).toEqual([]);
  });

  it('should treat accepted language matching as case-insensitive', async () => {
    const team = {
      teamMembers: ['A', 'B'],
      codeWarsUser: 'team-user',
      completedKatas: [],
      points: 0
    };

    userServiceSpy.getCodeChallengesByUser.and.returnValue(
      of({
        totalPages: 1,
        totalItems: 1,
        data: [
          {
            id: 'accepted-1',
            name: 'Nut Farm',
            slug: 'nut-farm',
            completedLanguages: ['JavaScript'],
            completedAt: '2025-04-11T01:00:00.000Z' as any
          }
        ]
      })
    );

    userServiceSpy.getCodeChallenge.and.returnValue(of(acceptedChallenge));

    const result = await firstValueFrom((component as any).loadTeamData(team)) as ScoreBoardItem;

    expect(result.points).toBe(200);
    expect(result.completedKatas).toEqual(['Nut Farm']);
  });

  it('should assign rank undefined when points are tied', async () => {
    const teamsSubject = (component as any).teamsSubject;
    teamsSubject.next([
      { teamMembers: ['A'], codeWarsUser: 'u1', completedKatas: [], points: 0 },
      { teamMembers: ['B'], codeWarsUser: 'u2', completedKatas: [], points: 0 }
    ]);

    spyOn<any>(component, 'loadTeamData').and.callFake((team: any) =>
      of({ ...team, points: 50, completedKatas: ['Nut Farm'] })
    );

    const result = await firstValueFrom((component as any).loadScoreboardData()) as ScoreBoardItem[];

    expect(result[0].rank).toBe(1);
    expect(result[1].rank).toBeUndefined();
  });

  it('should sort by points and assign sequential ranks when not tied', async () => {
    const teamsSubject = (component as any).teamsSubject;
    teamsSubject.next([
      { teamMembers: ['A'], codeWarsUser: 'u1', completedKatas: [], points: 0 },
      { teamMembers: ['B'], codeWarsUser: 'u2', completedKatas: [], points: 0 }
    ]);

    spyOn<any>(component, 'loadTeamData').and.returnValues(
      of({ teamMembers: ['A'], codeWarsUser: 'u1', completedKatas: ['k1'], points: 20 }),
      of({ teamMembers: ['B'], codeWarsUser: 'u2', completedKatas: ['k2'], points: 50 })
    );

    const result = await firstValueFrom((component as any).loadScoreboardData()) as ScoreBoardItem[];

    expect(result[0].codeWarsUser).toBe('u2');
    expect(result[0].rank).toBe(1);
    expect(result[1].rank).toBe(2);
  });

  it('should fetch multiple pages when totalPages is greater than 1', async () => {
    const team = {
      teamMembers: ['A'],
      codeWarsUser: 'paged-user',
      completedKatas: [],
      points: 0
    };

    userServiceSpy.getCodeChallengesByUser.and.callFake((_, page: number) => {
      if (page === 0) {
        return of({
          totalPages: 2,
          totalItems: 2,
          data: [
            {
              id: 'accepted-1',
              name: 'Nut Farm',
              slug: 'nut-farm',
              completedLanguages: ['javascript'],
              completedAt: '2025-04-11T01:00:00.000Z' as any
            }
          ]
        });
      }

      return of({
        totalPages: 2,
        totalItems: 2,
        data: [
          {
            id: 'accepted-2',
            name: 'Nut Farm',
            slug: 'nut-farm',
            completedLanguages: ['javascript'],
            completedAt: '2025-04-11T02:00:00.000Z' as any
          }
        ]
      });
    });

    userServiceSpy.getCodeChallenge.and.returnValue(of(acceptedChallenge));

    const result = await firstValueFrom((component as any).loadTeamData(team)) as ScoreBoardItem;

    expect(userServiceSpy.getCodeChallengesByUser).toHaveBeenCalledTimes(2);
    expect(result.completedKatas.length).toBe(2);
  });

  it('should throw when team fetch errors are not tolerated', async () => {
    const previous = SCOREBOARD_RUNTIME_CONFIG.tolerateTeamFetchErrors;
    SCOREBOARD_RUNTIME_CONFIG.tolerateTeamFetchErrors = false;

    userServiceSpy.getCodeChallengesByUser.and.returnValue(throwError(() => new Error('boom')));

    const result$ = (component as any).loadTeamData({
      teamMembers: ['A'],
      codeWarsUser: 'u1',
      completedKatas: [],
      points: 0
    });

    await expectAsync(firstValueFrom(result$)).toBeRejected();

    SCOREBOARD_RUNTIME_CONFIG.tolerateTeamFetchErrors = previous;
  });

  it('should throw when challenge detail errors are not tolerated', async () => {
    const previousChallengeTolerance = SCOREBOARD_RUNTIME_CONFIG.tolerateChallengeDetailErrors;
    const previousTeamTolerance = SCOREBOARD_RUNTIME_CONFIG.tolerateTeamFetchErrors;
    SCOREBOARD_RUNTIME_CONFIG.tolerateChallengeDetailErrors = false;
    SCOREBOARD_RUNTIME_CONFIG.tolerateTeamFetchErrors = false;

    userServiceSpy.getCodeChallengesByUser.and.returnValue(
      of({
        totalPages: 1,
        totalItems: 1,
        data: [
          {
            id: 'accepted-1',
            name: 'Nut Farm',
            slug: 'nut-farm',
            completedLanguages: ['javascript'],
            completedAt: '2025-04-11T01:00:00.000Z' as any
          }
        ]
      })
    );
    userServiceSpy.getCodeChallenge.and.returnValue(throwError(() => new Error('detail boom')));

    const result$ = (component as any).loadTeamData({
      teamMembers: ['A'],
      codeWarsUser: 'u1',
      completedKatas: [],
      points: 0
    });

    await expectAsync(firstValueFrom(result$)).toBeRejected();

    SCOREBOARD_RUNTIME_CONFIG.tolerateChallengeDetailErrors = previousChallengeTolerance;
    SCOREBOARD_RUNTIME_CONFIG.tolerateTeamFetchErrors = previousTeamTolerance;
  });

  it('should read and update cache helpers correctly', () => {
    const initial = (component as any).getCache();
    expect(initial).toEqual({});

    (component as any).updateCache('accepted-1', acceptedChallenge);
    const cache = (component as any).getCache();

    expect(cache['accepted-1'].name).toBe('Nut Farm');
  });

  it('should tolerate team fetch errors when enabled', async () => {
    const previous = SCOREBOARD_RUNTIME_CONFIG.tolerateTeamFetchErrors;
    SCOREBOARD_RUNTIME_CONFIG.tolerateTeamFetchErrors = true;

    userServiceSpy.getCodeChallengesByUser.and.returnValue(throwError(() => new Error('boom')));

    const result = await firstValueFrom((component as any).loadTeamData({
      teamMembers: ['A'],
      codeWarsUser: 'u1',
      completedKatas: [],
      points: 0
    })) as ScoreBoardItem;

    expect(result.points).toBe(0);
    expect(result.completedKatas.length).toBe(0);

    SCOREBOARD_RUNTIME_CONFIG.tolerateTeamFetchErrors = previous;
  });

  it('should tolerate challenge detail errors when enabled', async () => {
    const previous = SCOREBOARD_RUNTIME_CONFIG.tolerateChallengeDetailErrors;
    SCOREBOARD_RUNTIME_CONFIG.tolerateChallengeDetailErrors = true;

    userServiceSpy.getCodeChallengesByUser.and.returnValue(
      of({
        totalPages: 1,
        totalItems: 1,
        data: [
          {
            id: 'accepted-1',
            name: 'Nut Farm',
            slug: 'nut-farm',
            completedLanguages: ['javascript'],
            completedAt: '2025-04-11T01:00:00.000Z' as any
          }
        ]
      })
    );
    userServiceSpy.getCodeChallenge.and.returnValue(throwError(() => new Error('detail boom')));

    const result = await firstValueFrom((component as any).loadTeamData({
      teamMembers: ['A'],
      codeWarsUser: 'u1',
      completedKatas: [],
      points: 0
    })) as ScoreBoardItem;

    expect(result.points).toBe(0);
    expect(result.completedKatas).toEqual([]);

    SCOREBOARD_RUNTIME_CONFIG.tolerateChallengeDetailErrors = previous;
  });

  it('should fallback to challenge name when accepted slug display mapping is missing', async () => {
    (component as any).acceptedKataNameBySlug = new Map();

    const team = {
      teamMembers: ['A'],
      codeWarsUser: 'u1',
      completedKatas: [],
      points: 0
    };

    userServiceSpy.getCodeChallengesByUser.and.returnValue(
      of({
        totalPages: 1,
        totalItems: 1,
        data: [
          {
            id: 'accepted-1',
            name: 'Nut Farm',
            slug: 'nut-farm',
            completedLanguages: ['javascript'],
            completedAt: '2025-04-11T01:00:00.000Z' as any
          }
        ]
      })
    );
    userServiceSpy.getCodeChallenge.and.returnValue(of(acceptedChallenge));

    const result = await firstValueFrom((component as any).loadTeamData(team)) as ScoreBoardItem;
    expect(result.completedKatas).toEqual(['Nut Farm']);
  });

  it('should fallback to zero points when kata rank is not in rubric map', async () => {
    const outOfRubricChallenge: CodeChallengeResponse = {
      ...acceptedChallenge,
      rank: { id: -9, name: '9 kyu', color: 'white' }
    };

    userServiceSpy.getCodeChallengesByUser.and.returnValue(
      of({
        totalPages: 1,
        totalItems: 1,
        data: [
          {
            id: 'accepted-1',
            name: 'Nut Farm',
            slug: 'nut-farm',
            completedLanguages: ['javascript'],
            completedAt: '2025-04-11T01:00:00.000Z' as any
          }
        ]
      })
    );
    userServiceSpy.getCodeChallenge.and.returnValue(of(outOfRubricChallenge));

    const result = await firstValueFrom((component as any).loadTeamData({
      teamMembers: ['A'],
      codeWarsUser: 'u1',
      completedKatas: [],
      points: 0
    })) as ScoreBoardItem;

    expect(result.points).toBe(0);
    expect(result.completedKatas).toEqual(['Nut Farm']);
  });

  it('should use top-level fallback item when tolerant mode is on and detail fetch throws', async () => {
    const previousTeamTolerance = SCOREBOARD_RUNTIME_CONFIG.tolerateTeamFetchErrors;
    const previousDetailTolerance = SCOREBOARD_RUNTIME_CONFIG.tolerateChallengeDetailErrors;
    SCOREBOARD_RUNTIME_CONFIG.tolerateTeamFetchErrors = true;
    SCOREBOARD_RUNTIME_CONFIG.tolerateChallengeDetailErrors = false;

    userServiceSpy.getCodeChallengesByUser.and.returnValue(
      of({
        totalPages: 1,
        totalItems: 1,
        data: [
          {
            id: 'accepted-1',
            name: 'Nut Farm',
            slug: 'nut-farm',
            completedLanguages: ['javascript'],
            completedAt: '2025-04-11T01:00:00.000Z' as any
          }
        ]
      })
    );
    userServiceSpy.getCodeChallenge.and.returnValue(throwError(() => new Error('detail boom')));

    const result = await firstValueFrom((component as any).loadTeamData({
      teamMembers: ['A'],
      codeWarsUser: 'u1',
      completedKatas: ['seed'],
      points: 999
    })) as ScoreBoardItem;

    expect(result.points).toBe(0);
    expect(result.completedKatas).toEqual([]);

    SCOREBOARD_RUNTIME_CONFIG.tolerateTeamFetchErrors = previousTeamTolerance;
    SCOREBOARD_RUNTIME_CONFIG.tolerateChallengeDetailErrors = previousDetailTolerance;
  });
});
