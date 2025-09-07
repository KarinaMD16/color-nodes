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
  });

export const usePlaceInitial = (gameId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: PlaceInitialCupsRequest) => postPlaceInitial(gameId, body),
    onSuccess: (data) => qc.setQueryData(['game', gameId], data),
  });
};

export const useSwapMove = (gameId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SwapRequest) => postSwap(gameId, body),
    // Optimistic UI: intercambia local y hace rollback si falla
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: ['game', gameId] });
      const prev = qc.getQueryData<GameStateResponse>(['game', gameId]);
      if (prev) {
        const next = structuredClone(prev);
        const { fromIndex, toIndex } = body;
        [next.cups[fromIndex], next.cups[toIndex]] = [next.cups[toIndex], next.cups[fromIndex]];
        qc.setQueryData(['game', gameId], next);
      }
      return { prev };
    },
    onError: (_e, _b, ctx) => {
      if (ctx?.prev) qc.setQueryData(['game', gameId], ctx.prev);
    },
    onSuccess: (data) => qc.setQueryData(['game', gameId], data),
  });
};

export const useTick = (gameId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => postTick(gameId),
    onSuccess: (data) => qc.setQueryData(['game', gameId], data),
  });
};
