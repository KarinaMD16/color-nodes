import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { usePostJoinRoom } from '../hooks/userHooks'
import { useState } from 'react'
import { useUser } from '../context/userContext'
import router from '../router'

export const joinRoute = createRoute({
  component: JoinPage,
  getParentRoute: () => rootRoute,
  path: '/join',
})

function JoinPage() {
  const [roomCode, setRoomCode] = useState('');
  const { username: ctxName } = useUser();
  const [name, setName] = useState(ctxName ?? '');     // ← estado local editable
  const { mutate: postJoinRoom, isPending } = usePostJoinRoom();

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (isPending) return; // avoid duplicate submits while loading
    const finalName = name.trim();
    if (!roomCode || !finalName) return;
    postJoinRoom({ username: finalName, roomCode });
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <video
        className="fixed top-0 left-0 w-full h-full object-cover z-0"
        src="/space-background-video.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="fixed inset-0 bg-black/50 z-1"></div>
      <div className="fixed inset-0 flex items-center font-press-start text-white text-left justify-center p-4 z-10">
        <form onSubmit={handleSubmit} className="w-full space-y-6 max-w-2xl mx-auto p-6">
          <h1 className="font-press-start text-center text-3xl md:text-4xl mb-8 whitespace-nowrap">
            <span style={{ color: '#7F5CC1' }}>Color</span>{' '}
            <span style={{ color: '#C15CAE' }}>Nodes</span>
            <span style={{ color: '#B0C15C' }}>!</span>
          </h1>

          <div className="nes-field">
            <label htmlFor="username_field">Username</label>
            <input
              type="text"
              id="username_field"
              className="nes-input is-dark w-full text-left"
              value={name}
              onChange={(e) => setName(e.target.value)}  // ← editable
              placeholder="Enter your username"
              disabled={isPending}
            />
        </div>

        <div className="nes-field">
          <label htmlFor="roomcode_field">Room Code</label>
          <input
            type="text"
            id="roomcode_field"
            className="nes-input is-dark w-full text-left"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            placeholder="Enter room code"
            disabled={isPending}
          />
        </div>

        <div 
          className="mt-8 flex flex-col items-center space-y-6"
          tabIndex={-1}
        >
            <label className="flex items-center space-x-4 is-pointer">
            <input 
              type="radio" 
              className="nes-radio" 
              name="room-action"
              tabIndex={0}
              onClick={() => handleSubmit()}
              disabled={isPending}
            />
            <span className={`font-press-start text-white text-sm ${isPending ? 'opacity-50' : ''}`}>
                {isPending ? 'Joining...' : 'Join'}
              </span>
          </label>
                                    
            <label className="flex items-center space-x-4 is-pointer">
            <input 
              type="radio" 
              className="nes-radio" 
              name="room-action"
              tabIndex={0}
              onClick={() => router.navigate({ to: '/' })}
              disabled={isPending}
            />
            <span className="font-press-start text-white text-sm">Back</span>
          </label>
        </div>
    </form>
  </div>
</div>
)
}
