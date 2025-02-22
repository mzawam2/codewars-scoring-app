        import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UsersCodeChallengesResponse } from './users-code-challenges-response';
import { CodeChallengeResponse } from './code-challenge-response';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getCodeChallengesByUser(userName: string, page: number): Observable<UsersCodeChallengesResponse>{
    return this.http.get<UsersCodeChallengesResponse>(`https://www.codewars.com/api/v1/users/${userName}/code-challenges/completed?page=${page}`)
  }
  getCodeChallenge(id: string): Observable<CodeChallengeResponse>{
    return this.http.get<CodeChallengeResponse>(`https://www.codewars.com/api/v1/code-challenges/${id}`)
  }
}
