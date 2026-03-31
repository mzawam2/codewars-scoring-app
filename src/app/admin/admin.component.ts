import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SCOREBOARD_TEAMS_CONFIG } from '../config/teams.config';

interface AdminTeamListItem {
  teamMembers: string[];
  codeWarsUser: string;
  originalIndex: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  teams: AdminTeamListItem[] = SCOREBOARD_TEAMS_CONFIG
    .map((team, originalIndex) => ({ ...team, originalIndex }))
    .sort((a, b) => a.codeWarsUser.localeCompare(b.codeWarsUser, undefined, { sensitivity: 'base' }));

  constructor(private router: Router) {}

  ngOnInit() {}

  selectTeam(teamIndex: number) {
    this.router.navigate(['/admin/team', teamIndex]);
  }
}
