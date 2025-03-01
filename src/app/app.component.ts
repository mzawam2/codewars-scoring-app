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
  teams: ScoreBoardItem[] = [{
    teamName: "Code Ninjas",
    teamMembers: ["Me", "MySelf"],
    codeWarsUser: "mzawam",
    completedKatas: [],
    points: 0
  },{
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
  },{
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
  }]; // ... add other teams

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.startPolling();
  }

  private startPolling() {
    // Initial load
    this.updateScores();
    
    // Poll every 5 minutes
    setInterval(() => {
      this.updateScores();
    }, 300000);
  }

  private async updateScores() {
    try {
      for (const team of this.teams) {
        const challenges = await this.loadTeamChallenges(team);
        team.completedKatas = [];
        team.points = 0;

        for (const challenge of challenges) {
          const details = await this.loadChallengeDetails(challenge.id)
          if(details){
            team.completedKatas.push(details.name);
            team.points += details.rank.id * -1;
          }
        }
      }
    } catch (error) {
      console.error('Error updating scores:', error);
    }
  }

  private async loadTeamChallenges(team: ScoreBoardItem) {
    const response = await this.userService
      .getCodeChallengesByUser(team.codeWarsUser, 0)
      .toPromise();
      if(response){
        return response.data.filter(challenge => 
          new Date(challenge.completedAt) > new Date("2024-04-10")
        );
      }
      return []
  }

  private async loadChallengeDetails(challengeId: string): Promise<any> {
    try{
      return await this.userService
      .getCodeChallenge(challengeId)
      .toPromise();
    }catch(error){
      console.error('Error loading challenge details:', error);
      return undefined;
    }
  }
}
