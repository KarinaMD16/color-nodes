import { useMutation, useQuery } from "@tanstack/react-query";
import { getLeaderboard, getRoom, getUserById, getUsersOrderedByScore, postCreateRoom, postCreateUser, postJoinRoom, postLeaveRoom } from "../services/userService";
import { User, UserRankDto, UserRoomRankDto } from "@/models/user";
import { useNavigate } from "@tanstack/react-router";
import { useUser } from "@/context/userContext";
import { getUsernames } from "../services/userService";
import { toast } from "@/lib/toast";

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
  const { setUser } = useUser();

  return useMutation({
    mutationFn: ({ username, roomCode }: { username: string, roomCode: string }) =>
      postJoinRoom(username, roomCode),

    onSuccess: (data, vars) => {
      const fromServer =
        (data?.user ?? data?.me ?? data?.player) as { id?: number; username?: string } | undefined;

      let uid   = fromServer?.id ?? data?.userId ?? null;
      let uname = fromServer?.username ?? data?.username ?? vars.username;

      if (!uid && Array.isArray(data?.users) && uname) {
        const me = data.users.find((u: any) =>
          String(u?.username ?? "").toLowerCase() === String(uname).toLowerCase()
        );
        if (me?.id) {
          uid = me.id;
          if (!uname) uname = me.username;
        }
      }

      if (uid && uname) {
        setUser(Number(uid), String(uname)); 
      } else {
        console.warn("⚠️ join success sin userId/username. Data:", data);
      }

      const code = data?.code ?? data?.roomCode ?? vars.roomCode;
      if (!code) {
        console.error("error: no code", data);
        return;
      }
      navigate({ to: `/room/${code}` });
    },

    onError: (error: any) => {
      const status = error?.response?.status
      const fallbackMsg =
        error?.response?.data?.message ??
        error?.message ??
        "Error joining room"
      const msg = status === 500 ? "Game already started" : fallbackMsg
      console.error(msg, error)
      toast.error("Error joining room: " + msg)
    }
  })
}

export function usePostLeaveRoom() {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: ({ userId, roomCode }: { userId: number, roomCode: string }) =>
            postLeaveRoom(userId, roomCode),
        onSuccess: (data) => {
            console.log('User left room successfully:', data);
             navigate({ to: '/' });
        },
        onError: (error) => {
            console.error('Error leaving room:', error);
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
      refetchOnMount: 'always',
        refetchInterval: (q) => (q.state.data?.activeGameId ? false : 1500),
        refetchOnWindowFocus: true,
    })
}

export function useGetUsersOrderedByScore() {
  return useQuery<User[], Error>({
    queryKey: ["users", "orderedByScore"],
    queryFn: getUsersOrderedByScore,
    refetchInterval: 5000, 
  })
}

export function useGetUsernames() {
  return useQuery<User[], Error>({
    queryKey: ["usernames"],
    queryFn: getUsernames,
    refetchInterval: 5000, 
  })
}

export function useGetLeaderboard(
  roomCode: string,
  enabledDefault = false,
  options?: { enabled?: boolean }
) {
  return useQuery<UserRoomRankDto[], Error>({
    queryKey: ["leaderboard", roomCode],
    queryFn: () => getLeaderboard(roomCode),
    enabled: options?.enabled ?? enabledDefault,
    refetchInterval: 5000,
  })
}


  
