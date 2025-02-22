export interface CodeChallengeResponse {
    id: string,
    name: string
    slug: string,
    url: string,
    category: string,
    description: string,
    tags: string[],
    languages: string[],
    rank: {
        id: number,
        name: string,
        color: string
    },
    createdBy: {
        username: string,
        url: string
    },
    approvedBy: {
        username: string,
        url: string
    },
    totalAttempts: number,
    totalCompleted: number,
    totalStars: number,
    voteScore: number,
    publishedAt: string,
    approvedAt: string
}
