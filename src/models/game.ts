export type GameStatus = 'Setup' | 'InProgress' | 'Finished';

export interface GameStateResponse {
  gameId: string;
  roomCode: string;
  status: string;
  cups: string[];
  hits: number;
  totalMoves: number;
  currentPlayerId: number | null;
  playerOrder: number[];
  turnEndsAtUtc: string;
  targetPattern: string[] | null;
  availableColors: string[];
}

export interface StartGameRequest {
     roomCode: string 
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
