import { CreateRoom, User } from "../models/user";
import colorNodesAPI from "../api/client";

export const postCreateRoom = async (username: string) => {
    const response = await colorNodesAPI.post<CreateRoom>("/Room/Create", { username });
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

export const postLeaveRoom = async (userId: number, roomCode: string) => {
    const response = await colorNodesAPI.post(`/Room/leave/${roomCode}`, { userId });
    return response.data;
}

export const getRoom = async (roomCode: string) => {
    const response = await colorNodesAPI.get(`/Room/by-code/${roomCode}`);
    return response.data;
}

export async function getUserById(id: number): Promise<User> {
  const { data } = await colorNodesAPI.get<User>(`/users/${id}`)
  return data
}