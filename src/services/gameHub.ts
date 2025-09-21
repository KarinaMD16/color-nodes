import * as signalR from '@microsoft/signalr';

type Handlers = {
  onStateUpdated?: (s: any) => void;
  onTurnChanged?: (p: { currentPlayerId: number }) => void;
  onHitFeedback?: (p: { message: string }) => void;
  onFinished?: (s: any) => void;
  onPlayerJoined?: (u: string) => void;
  onPlayerLeft?: (u: string) => void;
  onConn?: (status: 'connecting' | 'connected' | 'reconnecting' | 'disconnected', info?: any) => void;
  onChatMessage?: (msg: any) => void;
};

//kary: 26.233.244.31
//elein: 26.48.186.190
//lando: 26.166.216.244

const HUB_BASE_URL = 'http://26.166.216.244:5197';
const instances = new Map<string, ReturnType<typeof build>>();

function build(hubUrl: string, roomCode: string, username: string, initialHandlers: Handlers = {}) {
  const conn = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, { withCredentials: true })
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .build();

  const handlersMap = new Map<string, Set<Function>>();

  const addHandler = (event: string, handler: Function) => {
    if (!handlersMap.has(event)) {
      handlersMap.set(event, new Set());
    }
    handlersMap.get(event)!.add(handler);
  };

  const removeHandler = (event: string, handler: Function) => {
    if (handlersMap.has(event)) {
      handlersMap.get(event)!.delete(handler);
    }
  };

  const callHandlers = (event: string, ...args: any[]) => {
    const handlers = handlersMap.get(event);
    if (handlers && handlers.size > 0) {
      handlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  };

  conn.on('StateUpdated', s => requestAnimationFrame(() => callHandlers('StateUpdated', s)));
  conn.on('TurnChanged', id => requestAnimationFrame(() => callHandlers('TurnChanged', { currentPlayerId: id })));
  conn.on('HitFeedback', (m: string) => callHandlers('HitFeedback', { message: m }));
  conn.on('Finished', s => callHandlers('Finished', s));
  conn.on('PlayerJoined', u => callHandlers('PlayerJoined', u));
  conn.on('PlayerLeft', u => callHandlers('PlayerLeft', u));
  conn.on('ChatMessage', msg => callHandlers('ChatMessage', msg));

  conn.onreconnecting(err => callHandlers('Conn', 'reconnecting', err));
  conn.onreconnected(async id => {
    callHandlers('Conn', 'connected', { connId: id, reconnected: true });
    try {
      await conn.invoke('JoinRoom', roomCode, username);
      if (lastGameId) {
        await conn.invoke('JoinGame', lastGameId);
      }
    } catch (error) {
      console.error('Error re-joining after reconnect:', error);
    }
  });

  conn.onclose(err => callHandlers('Conn', 'disconnected', err));

  let started = false;
  let startPromise: Promise<void> | null = null;
  let lastGameId: string | null = null;

  async function start() {
    if (started) return;
    if (startPromise) return startPromise;

    startPromise = (async () => {
      callHandlers('Conn', 'connecting', { hubUrl });
      
      try {
        await conn.start();
        started = true;
        callHandlers('Conn', 'connected', { connId: conn.connectionId });
        
        await conn.invoke('JoinRoom', roomCode, username);
        
        if (lastGameId) {
          await conn.invoke('JoinGame', lastGameId);
        }
      } catch (error) {
        started = false;
        throw error;
      }
    })();

    try { 
      await startPromise; 
    } finally { 
      startPromise = null; 
    }
  }

  async function stop() {}

  async function joinGame(gameId: string) {
    lastGameId = gameId;
    if (conn.state === signalR.HubConnectionState.Connected) {
      await conn.invoke('JoinGame', gameId);
    }
  }

  async function sendChatMessage(roomCode: string, username: string, message: string) {
    if (conn.state === signalR.HubConnectionState.Connected) {
      await conn.invoke('SendChatMessage', roomCode, username, message);
    } else {
      throw new Error('SignalR connection is not ready');
    }
  }

  function registerHandlers(newHandlers: Handlers): () => void {
    const cleanupFunctions: Array<() => void> = [];

    Object.entries(newHandlers).forEach(([eventName, handler]) => {
      if (handler) {
        const mappedEventName = eventName.replace('on', '');
        addHandler(mappedEventName, handler);
        cleanupFunctions.push(() => removeHandler(mappedEventName, handler));
      }
    });

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }

  if (Object.keys(initialHandlers).length > 0) {
    registerHandlers(initialHandlers);
  }

  return { 
    connection: conn, 
    start, 
    stop, 
    joinGame, 
    sendChatMessage,
    registerHandlers
  };
}

export function getGameHub(roomCode: string, username: string, handlers?: Handlers) {
  const hubUrl = new URL('/gameHub', HUB_BASE_URL.replace(/\/+$/, '')).toString();
  const key = `${roomCode}::${username}`;
  
  if (!instances.has(key)) {
    instances.set(key, build(hubUrl, roomCode, username, handlers));
  }
  
  return instances.get(key)!;
}

export function clearGameHubInstance(roomCode: string, username: string) {
  const key = `${roomCode}::${username}`;
  instances.delete(key);
}