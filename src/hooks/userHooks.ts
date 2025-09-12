import { useMutation, useQuery } from "@tanstack/react-query";
import { getRoom, getUserById, postCreateRoom, postCreateUser, postJoinRoom, postLeaveRoom } from "../services/userService";
import { User } from "@/models/user";
import { useNavigate } from "@tanstack/react-router";
import { useUser } from "@/context/userContext";

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
      // 1) intenta formatos comunes
      const fromServer =
        (data?.user ?? data?.me ?? data?.player) as { id?: number; username?: string } | undefined;

      let uid   = fromServer?.id ?? data?.userId ?? null;
      let uname = fromServer?.username ?? data?.username ?? vars.username;

      // 2) fallback: búscate en data.users por username
      if (!uid && Array.isArray(data?.users) && uname) {
        const me = data.users.find((u: any) =>
          String(u?.username ?? "").toLowerCase() === String(uname).toLowerCase()
        );
        if (me?.id) {
          uid = me.id;
          if (!uname) uname = me.username;
        }
      }

      // 3) si hay (id, username) válidos -> persistir
      if (uid && uname) {
        setUser(Number(uid), String(uname)); // ← guarda en contexto + localStorage
      } else {
        console.warn("⚠️ join success sin userId/username. Respuesta:", data);
      }

      // 4) navegar
      const code = data?.code ?? data?.roomCode ?? vars.roomCode;
      if (!code) {
        console.error("❌ join: no hay code en la respuesta", data);
        return;
      }
      navigate({ to: `/room/${code}` });
    },

    onError: (error) => {
      console.error('Error joining room:', error);
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
        refetchInterval: (q) => (q.state.data?.activeGameId ? false : 1500),
        refetchOnWindowFocus: true,
    })
}