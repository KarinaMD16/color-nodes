import { User } from "../models/user";
import colorNodesAPI from "../api/client";

export const postCreateRoom = async (user: User) => {
    const response = await colorNodesAPI.post("/Room/Create", user);
    return response.data;
}

export const postCreateUser = async (username: string) => {
    const response = await colorNodesAPI.post("/Users", { username });
    return response.data;
}

export const postJoinRoom = async (username: string, roomCode: string) => {
    const response = await colorNodesAPI.post(`/Room/join/${username}/${roomCode}`);
    return response.data;
}
