export type GameStatus = 'Setup' | 'InProgress' | 'Finished';

export interface GameStateResponse {
  gameId: string;
  roomCode: string;
  status: string;
  cups: string[];
  hits: number;
  totalMoves: number;
  currentPlayerId: number;
  playerOrder: number[];
  turnEndsAtUtc: string;
  targetPattern: string[] | null;
  availableColors: string[];
}

export type StartGameRequest = {
  roomCode: string;
  userId: number;
};
export interface PlaceInitialCupsRequest { 
    playerId: number; 
    cups: string[] 
};

export interface SwapRequest { 
    playerId: number; 
    fromIndex: number; 
    toIndex: number 
};
