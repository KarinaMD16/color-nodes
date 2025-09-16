
export interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: string
  isSystem: boolean
}

export interface ChatGameProps {
  roomCode: string
  isCollapsed?: boolean
}
