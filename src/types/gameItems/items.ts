import { GameStateResponse } from '@/models/game';
import { ReactNode } from 'react'

export type DraggableCupProps = {
    id: string,
    children: ReactNode,
    data: any;
    activeId?:string;
}


export type DroppableSlotProps = {
    id: string,
    children: ReactNode
}
export type SetUpPhaseProps = {
  game: GameStateResponse
  setGame: (g: GameStateResponse) => void
  isMyTurn: boolean
  isAnimating: boolean
}
export type GamePhaseProps = {
  game: GameStateResponse
  setGame: (g: GameStateResponse) => void
}