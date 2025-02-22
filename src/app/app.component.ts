import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserService } from './user.service';
import { UsersCodeChallengesResponse } from './users-code-challenges-response';
import { BehaviorSubject, Observable, filter, from, map, mergeMap, switchMap, combineLatest, interval, startWith, takeUntil, Subject, reduce } from 'rxjs';
import { UsersCodeChallenge } from './users-code-challenge';
import { ScoreBoardItem } from './score-board-item';
import { ScoreboardComponent } from './scoreboard/scoreboard.component';
import { CommonModule } from '@angular/common';
import { CodeChallengeResponse } from './code-challenge-response';

@Component({
  selector: 'app-root',
  imports: [ ScoreboardComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'ScoreBoard';
  
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
  },
]);

  // Observable for the UI to subscribe to
  public readonly scoreBoardItems$: Observable<ScoreBoardItem[]>;

  constructor(private userService: UserService) {
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

  private loadScoreboardData(): Observable<ScoreBoardItem[]> {
    return this.teamsSubject.pipe(
      switchMap(teams => {
        // Create an observable for each team's data
        const teamObservables = teams.map(team => this.loadTeamData(team));
        // Combine all team observables
        return combineLatest(teamObservables);
      })
    );
  }

  private loadTeamData(team: ScoreBoardItem): Observable<ScoreBoardItem> {
    return this.userService.getCodeChallengesByUser(team.codeWarsUser, 0).pipe(
      mergeMap(resp => {
        const filteredResponse = resp.data.filter((codeChallenge: UsersCodeChallenge) => 
          new Date(codeChallenge.completedAt) > new Date("2015-04-10") 
        );
        return from(filteredResponse);
      }),
      mergeMap((codeChallenge: UsersCodeChallenge) => 
        this.userService.getCodeChallenge(codeChallenge.id).pipe(
          map(challenge => ({
            ...challenge,
            completedAt: codeChallenge.completedAt
          }))
        )
      ),
      // Collect all katas using reduce
      reduce((acc: ScoreBoardItem, challenge) => {
        // Calculate points based on kata rank and completion order
        const kataPoints = challenge.rank.id * -1; // Convert negative rank to positive points
        return {
          ...acc,
          completedKatas: [...acc.completedKatas, challenge.name+"  |"+ new Date(challenge.completedAt).getHours()+":"+ new Date(challenge.completedAt).getMinutes()],
          points: acc.points + kataPoints,
          time: new Date().getHours() + ":" + new Date().getMinutes()
        };
      }, {...team, completedKatas: [], points: 0}) // Start with fresh completedKatas array and points
    );
  }
}
