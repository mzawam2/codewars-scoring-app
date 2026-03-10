        import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UsersCodeChallengesResponse } from './users-code-challenges-response';
import { CodeChallengeResponse } from './code-challenge-response';
import { CODEWARS_API_CONFIG } from './config/api.config';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = CODEWARS_API_CONFIG.baseUrl;

  constructor(private http: HttpClient) { }

  getCodeChallengesByUser(userName: string, page: number): Observable<UsersCodeChallengesResponse>{
    return this.http.get<UsersCodeChallengesResponse>(`${this.baseUrl}/users/${userName}/code-challenges/completed?page=${page}`)
  }
  getCodeChallenge(id: string): Observable<CodeChallengeResponse>{
    return this.http.get<CodeChallengeResponse>(`${this.baseUrl}/code-challenges/${id}`)
  }
}
