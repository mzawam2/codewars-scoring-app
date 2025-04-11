import { User } from "./user";

export interface ScoreBoardItem {
  teamMembers: string[],
  codeWarsUser: string,
  completedKatas: string[],
  points: number,
  time?: string,
  rank?: number // Add rank property
}
