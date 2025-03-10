import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserService } from './user.service';
import { UsersCodeChallengesResponse } from './users-code-challenges-response';
import { BehaviorSubject, Observable, filter, from, map, mergeMap, switchMap, combineLatest, interval, startWith, takeUntil, Subject, reduce, of } from 'rxjs';
import { UsersCodeChallenge } from './users-code-challenge';
import { ScoreBoardItem } from './score-board-item';
import { ScoreboardComponent } from './scoreboard/scoreboard.component';
import { CommonModule } from '@angular/common';
import { CodeChallengeResponse } from './code-challenge-response';

const CACHE_KEY = 'codewars_challenge_cache';

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
export class AppComponent implements OnInit, OnDestroy {
  title = 'Hackathon ScoreBoard';
  private readonly userService = inject(UserService);
  private kataPoints = new Map<number, number>([
    [8, 5],
    [7, 15],
    [6, 30],
    [5, 50],
    [4, 75],
    [3, 100],
    [2, 150],
    [1, 200]
  ]);

  solvedChallenges: UsersCodeChallenge[] = [];
  private readonly destroy$ = new Subject<void>();
  private readonly teamsSubject = new BehaviorSubject<ScoreBoardItem[]>([{
    teamName: "Code Ninjas",
    teamMembers: ["Me", "MySelf"],
    codeWarsUser: "mzawam",
    completedKatas: [],
    points: 0
  }, {
    teamName: "Code Ninjas2",
    teamMembers: ["The Dude", "Donnie"],
    codeWarsUser: "xDranik",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Code Ninjas3",
    teamMembers: ["Josh", "Noah"],
    codeWarsUser: "Cousin-Joe",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Code Ninjas4",
    teamMembers: ["Ian", "John"],
    codeWarsUser: "cyclump",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Code Ninjas5",
    teamMembers: ["Joseph", "Donnie"],
    codeWarsUser: "10PercentTestCoverage",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Code Ninjas6",
    teamMembers: ["Steve", "Morty"],
    codeWarsUser: "SteveSitko",
    completedKatas: [],
    points: 0
  }, {
    teamName: "Maggie Cook",
    teamMembers: ["Maggie Cook"],
    codeWarsUser: "maggie_cook",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Lauren Toth",
    teamMembers: ["Lauren Toth"],
    codeWarsUser: "laurentoth",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Drew Cellar",
    teamMembers: ["Drew Cellar"],
    codeWarsUser: "dCellar",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Chethas Pyla",
    teamMembers: ["Chethas Pyla"],
    codeWarsUser: "chethas1",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Karthik Thokala",
    teamMembers: ["Karthik Thokala"],
    codeWarsUser: "karthikThokala",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Anna Peters",
    teamMembers: ["Anna Peters"],
    codeWarsUser: "ampeters",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Kieran Fields",
    teamMembers: ["Kieran Fields"],
    codeWarsUser: "Kyiranes",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Rohan Baste-Bania",
    teamMembers: ["Rohan Baste-Bania"],
    codeWarsUser: "RohanBB",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Will Robertson",
    teamMembers: ["Will Robertson"],
    codeWarsUser: "wrobertson2024",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Parker Brownlowe",
    teamMembers: ["Parker Brownlowe"],
    codeWarsUser: "TheGamer1002",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Jachin Ocacio",
    teamMembers: ["Jachin Ocacio"],
    codeWarsUser: "BaconEmojis",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Landond Derryberry",
    teamMembers: ["Landond Derryberry"],
    codeWarsUser: "Lderryberry",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Lora Hackworth",
    teamMembers: ["Lora Hackworth"],
    codeWarsUser: "LoraGHackworth",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Hannah Myers",
    teamMembers: ["Hannah Myers"],
    codeWarsUser: "xstinkylickerxmeow",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Andrew Semchishin",
    teamMembers: ["Andrew Semchishin"],
    codeWarsUser: "AndrewSem775",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Patrick Dunn",
    teamMembers: ["Patrick Dunn"],
    codeWarsUser: "patmd",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Sasha",
    teamMembers: ["Sasha"],
    codeWarsUser: "MildRacc",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Chris Pomeroy",
    teamMembers: ["Chris Pomeroy"],
    codeWarsUser: "NullPointerException-1",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Joseph Momot",
    teamMembers: ["Joseph Momot"],
    codeWarsUser: "JosephMomot",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Jared Rabadam",
    teamMembers: ["Jared Rabadam"],
    codeWarsUser: "jrab",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Philip Gu",
    teamMembers: ["Philip Gu"],
    codeWarsUser: "pgu15",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Raghava Deivanaathan",
    teamMembers: ["Raghava Deivanaathan"],
    codeWarsUser: "RaghavaD",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Noirit Ghosh Choudhuri",
    teamMembers: ["Noirit Ghosh Choudhuri"],
    codeWarsUser: "noiritgc",
    completedKatas: [],
    points: 0
  },
  {
    teamName: "Michael Lindsay",
    teamMembers: ["Michael Lindsay"],
    codeWarsUser: "Lindsay.1",
    completedKatas: [],
    points: 0
  },
  ]);

  // Observable for the UI to subscribe to
  public readonly scoreBoardItems$: Observable<ScoreBoardItem[]>;

  constructor() {
    // Set up the main data stream
    this.scoreBoardItems$ = interval(300000).pipe(
      startWith(0), // Emit immediately and then every 5 minutes
      switchMap(() => this.loadScoreboardData()),
      takeUntil(this.destroy$)
    );
  }

  ngOnInit(): void {
    // Subscribe to start the data flow
    this.scoreBoardItems$.subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getCache(): ChallengeCache {
    const cached = sessionStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  }

  private updateCache(id: string, challenge: CodeChallengeResponse & { completedAt: string }): void {
    const currentCache = this.getCache();
    const updatedCache = {
      ...currentCache,
      [id]: challenge
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(updatedCache));
  }

  private getCachedChallenge(id: string, completedAt: string): Observable<CodeChallengeResponse & { completedAt: string }> {
    const cache = this.getCache();
    if (cache[id]) {
      return of(cache[id]);
    }

    return this.userService.getCodeChallenge(id).pipe(
      map(challenge => {
        const challengeWithTime = { ...challenge, completedAt };
        // Update cache
        this.updateCache(id, challengeWithTime);
        return challengeWithTime;
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
              // If the previous team has the same points, assign the same rank
              if( index === 0 || previousTeam.points !== team.points) {
                return { ...team, rank: index + 1};
              }
              else if (previousTeam && previousTeam.points === team.points) {
                return { ...team, rank: sortedTeams[index - 1].rank };
              } else {
                return { ...team, rank: (sortedTeams[index - 1].rank ?? 0) + 1};
              }
            });
          })
        );
      })
    );
  }

  private loadTeamData(team: ScoreBoardItem): Observable<ScoreBoardItem> {
    const startDate = new Date("2024-04-01").getTime();

    return this.userService.getCodeChallengesByUser(team.codeWarsUser, 0).pipe(
      mergeMap(resp => {
        const filteredResponse = resp.data.filter((codeChallenge: UsersCodeChallenge) =>
          new Date(codeChallenge.completedAt).getTime() > startDate
        );
        return from(filteredResponse);
      }),
      mergeMap((codeChallenge: UsersCodeChallenge) =>
        this.getCachedChallenge(codeChallenge.id, new Date(codeChallenge.completedAt).toDateString())
      ),
      reduce((acc: ScoreBoardItem, challenge) => {
        const kataPts = this.kataPoints.get(Math.abs(challenge.rank.id)) || 0;
        return {
          ...acc,
          completedKatas: [...acc.completedKatas, challenge.name],
          points: acc.points + kataPts,
          time: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`
        };
      }, { ...team, completedKatas: [], points: 0 })
    );
  }
}
