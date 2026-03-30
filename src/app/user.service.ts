import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UsersCodeChallengesResponse } from './users-code-challenges-response';
import { CodeChallengeResponse } from './code-challenge-response';
import { CODEWARS_API_CONFIG } from './config/api.config';
import { DataModeService } from './services/data-mode.service';
import { MOCK_CODE_CHALLENGES_BY_ID, MOCK_COMPLETED_KATAS_BY_TEAM } from './services/mock-data.service';
import { SCOREBOARD_TEAMS_CONFIG } from './config/teams.config';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = CODEWARS_API_CONFIG.baseUrl;
  private readonly dataModeService = inject(DataModeService);
  private readonly http = inject(HttpClient);

  getCodeChallengesByUser(userName: string, page: number): Observable<UsersCodeChallengesResponse>{
    if (this.dataModeService.isMockMode()) {
      // Find team index by username
      const teamIndex = SCOREBOARD_TEAMS_CONFIG.findIndex(t => t.codeWarsUser === userName);
      if (teamIndex >= 0 && teamIndex in MOCK_COMPLETED_KATAS_BY_TEAM) {
        const mockKatas = MOCK_COMPLETED_KATAS_BY_TEAM[teamIndex];
        const itemsPerPage = 10;
        const start = page * itemsPerPage;
        const end = start + itemsPerPage;
        const pageData = mockKatas.slice(start, end);

        return of({
          totalPages: Math.ceil(mockKatas.length / itemsPerPage),
          totalItems: mockKatas.length,
          data: pageData
        });
      }
    }

    return this.http.get<UsersCodeChallengesResponse>(`${this.baseUrl}/users/${userName}/code-challenges/completed?page=${page}`);
  }

  getCodeChallenge(id: string): Observable<CodeChallengeResponse>{
    if (this.dataModeService.isMockMode()) {
      const mockChallenge = MOCK_CODE_CHALLENGES_BY_ID[id];
      if (mockChallenge) {
        return of(mockChallenge);
      }
    }

    return this.http.get<CodeChallengeResponse>(`${this.baseUrl}/code-challenges/${id}`);
  }
}
