export interface User {
    id?: number;
    username: string;
}

export interface CreateRoom {
    code: string;
    leaderId: number;
    users: User[];
}

export interface Room {
    id: number;
    code: string;
    leaderId: number;
    users: User[];
}