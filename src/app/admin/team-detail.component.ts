import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../user.service';
import { UsersCodeChallenge } from '../users-code-challenge';
import { SCOREBOARD_TEAMS_CONFIG } from '../config/teams.config';
import { Subscription, Observable, of, forkJoin } from 'rxjs';
import { mergeMap, map, catchError } from 'rxjs/operators';
import { EVENT_WINDOW_CONFIG } from '../config/event.config';
import { ACCEPTED_KATAS_CONFIG, ACCEPTED_LANGUAGES_CONFIG, SCORE_RUBRIC_CONFIG } from '../config/scoring.config';

type SortField = 'name' | 'completedAt' | 'difficulty' | 'points';
type SortDirection = 'asc' | 'desc';

interface TeamKataRow extends UsersCodeChallenge {
  difficulty: string;
  difficultyRank: number;
  points: number;
}

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team-detail.component.html',
  styleUrl: './team-detail.component.scss'
})
export class TeamDetailComponent implements OnInit, OnDestroy {
  teamIndex: number | null = null;
  teamName = '';
  teamMembers: string[] = [];
  katas: TeamKataRow[] = [];
  filteredKatas: TeamKataRow[] = [];
  loading = true;
  error = '';

  sortField: SortField = 'completedAt';
  sortDirection: SortDirection = 'desc';

  private allPages: TeamKataRow[] = [];
  private subscriptions = new Subscription();
  readonly displayTimeZone = EVENT_WINDOW_CONFIG.timeZone;
  private readonly eventStartMs = new Date(EVENT_WINDOW_CONFIG.startIsoEastern).getTime();
  private readonly eventEndMs = new Date(EVENT_WINDOW_CONFIG.endIsoEastern).getTime();
  private readonly acceptedKataSlugs = new Set(ACCEPTED_KATAS_CONFIG.map((kata) => kata.slug));
  private readonly acceptedLanguages = new Set(ACCEPTED_LANGUAGES_CONFIG.map((lang) => lang.toLowerCase()));
  private readonly kataPoints = new Map<number, number>(
    Object.entries(SCORE_RUBRIC_CONFIG).map(([rank, points]) => [Number(rank), points])
  );

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const params = this.route.snapshot.params;
    this.teamIndex = parseInt(params['teamIndex'], 10);

    if (this.teamIndex === null || this.teamIndex < 0 || this.teamIndex >= SCOREBOARD_TEAMS_CONFIG.length) {
      this.error = 'Team not found';
      this.loading = false;
      return;
    }

    const team = SCOREBOARD_TEAMS_CONFIG[this.teamIndex];
    this.teamName = team.codeWarsUser;
    this.teamMembers = team.teamMembers;

    this.loadAllPages(team.codeWarsUser);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private loadAllPages(userName: string) {
    this.loading = true;
    this.error = '';
    this.allPages = [];

    const fetchAllPages = (page: number): Observable<UsersCodeChallenge[]> =>
      this.userService.getCodeChallengesByUser(userName, page).pipe(
        mergeMap((response) => {
          const eligibleOnPage = response.data.filter((challenge) => this.isContestEligible(challenge));
          if (page + 1 < response.totalPages) {
            return fetchAllPages(page + 1).pipe(
              map((nextPageData) => [...eligibleOnPage, ...nextPageData])
            );
          }
          return of(eligibleOnPage);
        })
      );

    const sub = fetchAllPages(0).pipe(
      mergeMap((allChallenges) => this.enrichWithDifficultyAndPoints(allChallenges)),
      catchError((err) => {
        console.error('Error loading completed challenges:', err);
        this.error = 'Failed to load completed katas';
        this.loading = false;
        return of([]);
      })
    ).subscribe((allChallenges) => {
      this.allPages = allChallenges;
      this.katas = this.allPages;
      this.applySort();
      this.loading = false;
    });

    this.subscriptions.add(sub);
  }

  private enrichWithDifficultyAndPoints(challenges: UsersCodeChallenge[]): Observable<TeamKataRow[]> {
    if (!challenges.length) {
      return of([]);
    }

    return forkJoin(
      challenges.map((challenge) =>
        this.userService.getCodeChallenge(challenge.id).pipe(
          map((detail) => {
            const rank = Math.abs(detail.rank?.id ?? 0);
            return {
              ...challenge,
              difficulty: detail.rank?.name ?? 'N/A',
              difficultyRank: rank || Number.MAX_SAFE_INTEGER,
              points: this.kataPoints.get(rank) ?? 0,
            };
          }),
          catchError(() =>
            of({
              ...challenge,
              difficulty: 'N/A',
              difficultyRank: Number.MAX_SAFE_INTEGER,
              points: 0,
            })
          )
        )
      )
    );
  }

  private isContestEligible(challenge: UsersCodeChallenge): boolean {
    const completedTime = new Date(challenge.completedAt).getTime();
    const inEventWindow = completedTime > this.eventStartMs && completedTime <= this.eventEndMs;
    const hasAcceptedLanguage = challenge.completedLanguages
      ?.some((language) => this.acceptedLanguages.has(language.toLowerCase()));
    const isAcceptedKata = this.acceptedKataSlugs.has(challenge.id) || this.acceptedKataSlugs.has(challenge.slug);

    return inEventWindow && !!hasAcceptedLanguage && isAcceptedKata;
  }

  sort(field: SortField) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = field === 'completedAt' ? 'desc' : 'asc';
    }
    this.applySort();
  }

  private applySort() {
    this.filteredKatas = [...this.katas].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (this.sortField) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'completedAt':
          aVal = new Date(a.completedAt).getTime();
          bVal = new Date(b.completedAt).getTime();
          break;
        case 'difficulty':
          aVal = a.difficultyRank;
          bVal = b.difficultyRank;
          break;
        case 'points':
          aVal = a.points;
          bVal = b.points;
          break;
        default:
          return 0;
      }

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  getSortIndicator(field: SortField): string {
    if (this.sortField !== field) return '';
    return this.sortDirection === 'asc' ? ' ▲' : ' ▼';
  }

  get totalPoints(): number {
    return this.filteredKatas.reduce((sum, kata) => sum + kata.points, 0);
  }

  goBack() {
    this.router.navigate(['/admin']);
  }
}
