import { UsersCodeChallenge } from "./users-code-challenge"

export interface UsersCodeChallengesResponse {
    "totalPages": number,
    "totalItems":number,
    "data": Array<UsersCodeChallenge>
}
