import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getGame, postGameStart, postPlaceInitial, postSwap, postTick } from '@/services/gameService';
import { PlaceInitialCupsRequest, SwapRequest, GameStateResponse } from '@/models/game';

export const useGameState = (gameId?: string) =>
  useQuery({
    enabled: !!gameId,
    queryKey: ['game', gameId],
    queryFn: () => getGame(gameId!),
    staleTime: 5_000,
});

export const useStartGame = () =>
  useMutation({
    mutationFn: postGameStart,
    onSuccess: (data) => {
      if (data?.gameId) localStorage.setItem(`game_code`, data.gameId)
    },
});

export const usePlaceInitial = (gameId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PlaceInitialCupsRequest) => postPlaceInitial(gameId, body),
    onSuccess: (data) => qc.setQueryData(['game', gameId], data),
  });
};

export function useSwapMove(gameId: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation<GameStateResponse, Error, SwapRequest>({
    mutationFn: (body) => postSwap(gameId, body),
    onSuccess: (updated) => {
      if (updated?.gameId) {
        queryClient.setQueryData(['game', updated.gameId], updated)
      }
    },
  })

  return mutation
}

export const useTick = (gameId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => postTick(gameId),
    onSuccess: (data) => qc.setQueryData(['game', gameId], data),
  });
};