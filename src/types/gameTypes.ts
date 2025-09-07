export type GameState = {
  id: string
  status: 'Setup' | 'InProgress' | 'Finished'
  availableColors: string[]
  cups: string[]
  lastHits: number
  totalMoves: number
  
}