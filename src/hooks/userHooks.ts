import { useMutation, useQuery } from "@tanstack/react-query";
import { getRoom, getUserById, postCreateRoom, postCreateUser, postJoinRoom } from "../services/userService";
import { User } from "@/models/user";
import { useNavigate } from "@tanstack/react-router";

export function usePostCreateRoom() {
    return useMutation({
        mutationFn: postCreateRoom,
    })
}

export function usePostCreateUser() {
    return useMutation({
        mutationFn: postCreateUser,
    })
}

export function usePostJoinRoom() {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: ({ username, roomCode }: { username: string, roomCode: string }) =>
            postJoinRoom(username, roomCode),
        onSuccess: (data) => {
            console.log('User joined room successfully:', data);
            navigate({ to: `/room/${data.code}` });
        },
        onError: (error) => {
            console.error('Error joining room:', error);
        }
    })
}

export function useGetUser(id?: number) {
    return useQuery<User, Error>({
        queryKey: ['user', id],
        queryFn: () => getUserById(id!),
        enabled: !!id,
    })
}

export function useGetRoom(roomCode: string) {
    return useQuery({
        queryKey: ['room', roomCode],
        queryFn: () => getRoom(roomCode),
        enabled: !!roomCode,
    })
}