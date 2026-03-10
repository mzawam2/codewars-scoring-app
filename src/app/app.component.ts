import { Component, inject, OnDestroy } from '@angular/core';
import { UserService } from './user.service';
import { BehaviorSubject, Observable, catchError, filter, from, map, mergeMap, switchMap, combineLatest, interval, startWith, takeUntil, Subject, reduce, of, throwError } from 'rxjs';
import { UsersCodeChallenge } from './users-code-challenge';
import { ScoreBoardItem } from './score-board-item';
import { ScoreboardComponent } from './scoreboard/scoreboard.component';
import { CommonModule } from '@angular/common';
import { CodeChallengeResponse } from './code-challenge-response';
import { EVENT_WINDOW_CONFIG } from './config/event.config';
import { SCOREBOARD_RUNTIME_CONFIG } from './config/runtime.config';
import { ACCEPTED_KATAS_CONFIG, ACCEPTED_LANGUAGES_CONFIG, SCORE_RUBRIC_CONFIG } from './config/scoring.config';
import { SCOREBOARD_TEAMS_CONFIG } from './config/teams.config';
import { APP_DISPLAY_CONFIG } from './config/app-display.config';

const CACHE_KEY = SCOREBOARD_RUNTIME_CONFIG.challengeCacheKey;

interface ChallengeCache {
  [key: string]: CodeChallengeResponse & { completedAt: string };
}

@Component({
  selector: 'app-root',
  imports: [ScoreboardComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true
})
export class AppComponent implements OnDestroy {
  title = APP_DISPLAY_CONFIG.title;
  private readonly userService = inject(UserService);
  private kataPoints = new Map<number, number>(
    Object.entries(SCORE_RUBRIC_CONFIG).map(([rank, points]) => [Number(rank), points])
  );
  private readonly acceptedLanguages = new Set(ACCEPTED_LANGUAGES_CONFIG.map(language => language.toLowerCase()));
  private readonly acceptedKataSlugs = new Set(ACCEPTED_KATAS_CONFIG.map(kata => kata.slug));
  private readonly acceptedKataNameBySlug = new Map(ACCEPTED_KATAS_CONFIG.map(kata => [kata.slug, kata.name]));

  solvedChallenges: UsersCodeChallenge[] = [];
  private readonly destroy$ = new Subject<void>();
  private readonly teamsSubject = new BehaviorSubject<ScoreBoardItem[]>(
    SCOREBOARD_TEAMS_CONFIG.map(team => ({
      ...team,
      completedKatas: [],
      points: 0,
    }))
  );

  // Observable for the UI to subscribe to
  public readonly scoreBoardItems$: Observable<ScoreBoardItem[]>;

  constructor() {
    // Set up the main data stream
    this.scoreBoardItems$ = interval(SCOREBOARD_RUNTIME_CONFIG.refreshIntervalMs).pipe(
      startWith(0), // Emit immediately and then every 5 minutes
      switchMap(() => this.loadScoreboardData()),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getCache(): ChallengeCache {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  }

  private updateCache(id: string, challenge: CodeChallengeResponse): void {
    const currentCache = this.getCache();
    const updatedCache = {
      ...currentCache,
      [id]: challenge
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(updatedCache));
  }

  private getCachedChallenge(id: string): Observable<CodeChallengeResponse> {
    const cache = this.getCache();
    if (cache[id]) {
      return of(cache[id]);
    }

    return this.userService.getCodeChallenge(id).pipe(
      map(challenge => {
        this.updateCache(id, challenge);
        return challenge;
      })
    );
  }

  private loadScoreboardData(): Observable<ScoreBoardItem[]> {
    return this.teamsSubject.pipe(
      switchMap(teams => {
        // Create an observable for each team's data
        const teamObservables = teams.map(team => this.loadTeamData(team));
        // Combine all team observables
        return combineLatest(teamObservables).pipe(
          map(scoreBoardItems => {
            // Sort teams by points in descending order
            const sortedTeams = scoreBoardItems.sort((a, b) => b.points - a.points);
            // Assign ranks based on sorted order
            return sortedTeams.map((team, index) => {
              const previousTeam = sortedTeams[index - 1];
              // If the previous team has the same points, do not assign a rank
              if (index === 0 || previousTeam.points !== team.points) {
                return { ...team, rank: index + 1 };
              }
              else {
                return { ...team, rank: undefined };
              }
            });
          })
        );
      })
    );
  }

  private loadTeamData(team: ScoreBoardItem): Observable<ScoreBoardItem> {
    const startDate = new Date(EVENT_WINDOW_CONFIG.startIsoUtc).getTime();
    const endDate = new Date(EVENT_WINDOW_CONFIG.endIsoUtc).getTime();

    const fetchAllPages = (page: number): Observable<UsersCodeChallenge[]> => {
      return this.userService.getCodeChallengesByUser(team.codeWarsUser, page).pipe(
        mergeMap(resp => {
          const filteredData = resp.data.filter((codeChallenge: UsersCodeChallenge) => {
            const completedTime = new Date(codeChallenge.completedAt).getTime();
            const hasAcceptedLanguage = codeChallenge.completedLanguages
              ?.some(language => this.acceptedLanguages.has(language.toLowerCase()));

            return completedTime > startDate && completedTime <= endDate && !!hasAcceptedLanguage;
          });
          if (page + 1 < resp.totalPages) {
            return fetchAllPages(page + 1).pipe(
              map(nextPageData => [...filteredData, ...nextPageData])
            );
          }
          return of(filteredData);
        }),
        catchError(err => (SCOREBOARD_RUNTIME_CONFIG.tolerateTeamFetchErrors ? of([]) : throwError(() => err)))
      );
    };

    return fetchAllPages(0).pipe(
      mergeMap((allChallenges: UsersCodeChallenge[]) =>
        from(allChallenges).pipe(
          mergeMap((codeChallenge: UsersCodeChallenge) =>
            this.getCachedChallenge(codeChallenge.id).pipe(
              catchError(err => (SCOREBOARD_RUNTIME_CONFIG.tolerateChallengeDetailErrors ? of(undefined) : throwError(() => err)))
            )
          ),
          filter((challenge): challenge is CodeChallengeResponse => !!challenge),
          reduce((acc: ScoreBoardItem, challenge) => {
            const isAcceptedKata = this.acceptedKataSlugs.has(challenge.slug);
            if (isAcceptedKata) {
              const displayName = this.acceptedKataNameBySlug.get(challenge.slug)
                ?? challenge.name;
              const kataPts = this.kataPoints.get(Math.abs(challenge.rank.id)) || 0;
              return {
                ...acc,
                completedKatas: [...acc.completedKatas, displayName],
                points: acc.points + kataPts,
                time: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`
              };
            }
            return acc; // Skip other katas
          }, { ...team, completedKatas: [], points: 0 })
        )
      ),
      catchError(err => (
        SCOREBOARD_RUNTIME_CONFIG.tolerateTeamFetchErrors
          ? of({ ...team, completedKatas: [], points: 0 })
          : throwError(() => err)
      ))
    );
  }
}
