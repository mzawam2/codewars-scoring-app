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
export class AppComponent implements OnDestroy {
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

  private getCachedChallenge(id: string): Observable<CodeChallengeResponse > {
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
              if( index === 0 || previousTeam.points !== team.points) {
                return { ...team, rank: index + 1};
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
    const startDate = new Date("2024-09-01").getTime();
    const acceptedKatas = [
      "Tiny Three-Pass Compiler",
      "Loopover",
      "Puzzle Fighter",
      "BECOME IMMORTAL",
      "Full Metal Chemist #1: build me...",
      "Transforming Maze Solver",
      "Game of Go",
      "Insane Coloured Triangles",
      "Evaluate mathematical expression",
      "The Millionth Fibonacci Kata",
      "Screen Locking Patterns",
      "Alphabetic Anagrams",
      "Battleship field validator",
      "Simplifying",
      "Blobservation",
      "Papers, Please",
      "Conway's Game of Life - Unlimited Edition",
      "Mahjong - #1 Pure Hand",
      "The observed PIN",
      "Ten-Pin Bowling",
      "Range Extraction",
      "Human Readable duration format",
      "So Many Permutations!",
      "Strings Max",
      "Let's Play Darts!",
      "Four Letter Words ~ Mutations",
      "Card-Chameleon, a Cipher with Playing Cards",
      "Optimized Pathfinding Algorithm",
      "First non-repeating character",
      "Nut Farm 2",
      "Regex Password Validation",
      "Catch the Bus",
      "Who likes it?",
      "Tribonacci Sequence",
      "Fibonacci, Tribonacci and friends",
      "Nut Farm",
      "Split Strings",
      "Emotional Sort",
      "Word a10n (abbreviation)",
      "Vowel Count",
      "Square Every Digit",
      "Getting the Middle Character",
      "You're a square!",
      "Isograms",
      "Square(n) Sum",
      "String repeat",
      "Grasshopper Summation",
      "Remove String Spaces",
    ]; // List of accepted katas

    const fetchAllPages = (page: number): Observable<UsersCodeChallenge[]> => {
      return this.userService.getCodeChallengesByUser(team.codeWarsUser, page).pipe(
        mergeMap(resp => {
          const filteredData = resp.data.filter((codeChallenge: UsersCodeChallenge) =>
            new Date(codeChallenge.completedAt).getTime() > startDate
          );
          if (resp.data.length > 0) {
            return fetchAllPages(page + 1).pipe(
              map(nextPageData => [...filteredData, ...nextPageData])
            );
          }
          return of(filteredData);
        })
      );
    };

    return fetchAllPages(0).pipe(
      mergeMap((allChallenges: UsersCodeChallenge[]) =>
        from(allChallenges).pipe(
          mergeMap((codeChallenge: UsersCodeChallenge) =>
            this.getCachedChallenge(codeChallenge.id)
          ),
          reduce((acc: ScoreBoardItem, challenge) => {
            if (acceptedKatas.includes(challenge.name)) { // Check if kata is in the accepted list
              const kataPts = this.kataPoints.get(Math.abs(challenge.rank.id)) || 0;
              return {
                ...acc,
                completedKatas: [...acc.completedKatas, challenge.name],
                points: acc.points + kataPts,
                time: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`
              };
            }
            return acc; // Skip other katas
          }, { ...team, completedKatas: [], points: 0 })
        )
      )
    );
  }
}
