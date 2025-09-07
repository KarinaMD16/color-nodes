import colorNodesAPI from '@/api/client';
import { StartGameRequest, GameStateResponse, PlaceInitialCupsRequest, SwapRequest } from '@/models/game';

export async function postGameStart(req: StartGameRequest) {
  const { data } = await colorNodesAPI.post<GameStateResponse>('/game/start', req);
  return data;
}

export async function getGame(id: string) {
  const { data } = await colorNodesAPI.get<GameStateResponse>(`/game/${id}`);
  return data;
}

export async function postPlaceInitial(id: string, body: PlaceInitialCupsRequest) {
  const { data } = await colorNodesAPI.post<GameStateResponse>(`/game/${id}/place-initial`, body);
  return data;
}

export async function postSwap(id: string, body: SwapRequest) {
  const { data } = await colorNodesAPI.post<GameStateResponse>(`/game/${id}/swap`, body);
  return data;
}

export async function postTick(id: string) {
  const { data } = await colorNodesAPI.post<GameStateResponse>(`/game/${id}/tick`);
  return data;
}
