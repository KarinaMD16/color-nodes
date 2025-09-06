import { useMutation } from "@tanstack/react-query";
import { postCreateRoom, postCreateUser, postJoinRoom } from "../services/userService";

export function usePostCreateRoom() {
    return useMutation({
        mutationFn: postCreateRoom,
    })
};

export function usePostCreateUser() {
    return useMutation({
        mutationFn: postCreateUser,
    })
};

export function usePostJoinRoom() {
    return useMutation({
        mutationFn: ({ username, roomCode }: { username: string, roomCode: string }) =>
            postJoinRoom(username, roomCode)
    })
}
