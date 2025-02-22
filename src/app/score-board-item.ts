import { User } from "./user";

export interface ScoreBoardItem {
teamName: string,
teamMembers: string[],
codeWarsUser: string,
completedKatas: string[],
points: number,  
time?: string 
}
