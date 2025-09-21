export type Handlers = {
  onStateUpdated?: (s: any) => void;
  onFinished?: (s: any) => void;
  onTurnChanged?: (p: any) => void;
  onHitFeedback?: (m: any) => void;
  onPlayerJoined?: (u: string) => void;
  onPlayerLeft?: (u: string) => void;
  onConn?: (status: 'connecting' | 'connected' | 'reconnecting' | 'disconnected', info?: any) => void;
  onChatMessage?: (msg: any) => void;
};
