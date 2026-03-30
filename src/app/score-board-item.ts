import { User } from "./user";

export interface LatestCompletedKata {
  name: string;
  difficulty: string;
  completedAt: string;
}

export interface ScoreBoardItem {
  teamMembers: string[],
  codeWarsUser: string,
  completedKatas: string[],
  totalCompletedKatas?: number,
  latestCompletedKata?: LatestCompletedKata,
  points: number,
  time?: string,
  rank?: number // Add rank property
}
