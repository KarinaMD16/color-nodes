export interface User {
    username: string;
}

export interface CreateRoom{
    code: string;
    leaderId: number;
    users: User[];
}