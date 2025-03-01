import { Component, OnInit } from '@angular/core';
import { UserService } from './user.service';
import { ScoreBoardItem } from './score-board-item';
import { ScoreboardComponent } from './scoreboard/scoreboard.component';

@Component({
  selector: 'app-root',
  imports: [ScoreboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Hackathon ScoreBoard';
  teams: ScoreBoardItem[] = INITIAL_TEAMS;
  private readonly POLL_INTERVAL = 300000; // 5 minutes
  private readonly START_DATE = new Date("2015-04-10");

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.startPolling();
  }

  private startPolling() {
    this.updateScores();
    setInterval(() => this.updateScores(), this.POLL_INTERVAL);
  }

  private async updateScores() {
    try {
      await Promise.all(
        this.teams.map(team => this.updateTeamScore(team))
      );
    } catch (error) {
      console.error('Error updating scores:', error);
    }
  }

  private async updateTeamScore(team: ScoreBoardItem) {
    const challenges = await this.loadTeamChallenges(team);
    const details = await this.loadChallengeDetails(challenges);
    
    team.completedKatas = details.map(d => d?.name).filter(name => name !== undefined) as string[];
    team.points = this.calculatePoints(details);
  }

  private async loadTeamChallenges(team: ScoreBoardItem) {
    const response = await this.userService 
      .getCodeChallengesByUser(team.codeWarsUser, 0)
      .toPromise();
    
    if(!response) return [];

    return response.data?.filter(challenge => 
      new Date(challenge.completedAt) > this.START_DATE
    );
  }

  private async loadChallengeDetails(challenges: any[]) {
    return await Promise.all(
      challenges.map(challenge => 
        this.userService.getCodeChallenge(challenge.id).toPromise()
      )
    );
  }

  private calculatePoints(challenges: any[]): number {
    return challenges.reduce((total, challenge) => 
      total + (challenge.rank.id * -1), 0
    );
  }
}

const INITIAL_TEAMS: ScoreBoardItem[] = [
  {
    teamName: "Code Ninjas",
    teamMembers: ["Me", "MySelf"],
    codeWarsUser: "mzawam",
    completedKatas: [],
    points: 0
  },
  {
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
  }
];
