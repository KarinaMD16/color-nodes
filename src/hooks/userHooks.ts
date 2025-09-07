import { useMutation, useQuery } from "@tanstack/react-query";
import { getUserById, postCreateRoom, postCreateUser, postJoinRoom } from "../services/userService";
import { User } from "@/models/user";

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

export function useGetUser(id?: number) {
    return useQuery<User, Error>({
        queryKey: ['user', id],
        queryFn: () => getUserById(id!),
        enabled: !!id,
    })
}