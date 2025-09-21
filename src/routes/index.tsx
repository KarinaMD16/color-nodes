import { createRoute, useNavigate } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { usePostCreateRoom, usePostCreateUser } from '../hooks/userHooks';
import { useUser } from '../context/userContext';
import router from '../router';
import { useState } from 'react';
import Leaderboard from '@/components/leaderBoard/LeaderBoard';
import GameInfo from '@/components/GameInfo';
import { toast } from '@/lib/toast';

export const indexRoute = createRoute({
  component: IndexPage,
  getParentRoute: () => rootRoute,
  path: '/',
})

function IndexPage() {
  const { mutate: createRoom } = usePostCreateRoom()
  const { mutate: createUser } = usePostCreateUser()
  const { setUser, username } = useUser()
  const [inputUsername, setInputUsername] = useState(username || '')
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)

  const navigate = useNavigate()
  const handleCreateRoom = () => {
    if (!inputUsername.trim()) {
      toast.warning('Please enter a username')
      return
    }

    setIsCreatingRoom(true)

    createUser(inputUsername, {
      onSuccess: (userData) => {
        
        const userId = userData.id || userData.userId
        if (userId) {
          setUser(userId, inputUsername)
        }

        createRoom(
          inputUsername,
          {
            onSuccess: (roomData) => {

            const roomCode = roomData.code 
            if (!roomCode) {
              toast.error('Error: No room code received')
              setIsCreatingRoom(false)
              return
            }

            navigate({
              to: '/room/$code',
              params: { code: roomCode }
            })
          },
          onError: () => {
            toast.error('Error creating room. Please try again.')
            setIsCreatingRoom(false)
          }
        })
      },
      onError: () => {
        toast.error('Error creating user. Please try again.')
        setIsCreatingRoom(false)
      }
    })
  }

  const handleJoinRoom = () => {
    navigate({ to: '/join' })
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <video
        className="fixed top-0 left-0 w-full h-full object-cover z-0"
        src="https://packaged-media.redd.it/ngwgetoqr7y51/pb/m2-res_1080p.mp4?m=DASHPlaylist.mpd&v=1&e=1757149200&s=36fd0cd68fdebb032055efa60d97a8830317d1e7"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="fixed inset-0 bg-black/50 z-1"></div>
      <Leaderboard />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto p-6 text-center font-press-start">
          <h1 className="font-press-start text-3xl md:text-4xl mb-8 whitespace-nowrap">
            <span style={{ color: '#7F5CC1' }}>Color</span>{' '}
            <span style={{ color: '#C15CAE' }}>Nodes</span>
            <span style={{ color: '#B0C15C' }}>!</span>
          </h1>
          
          <div className="nes-field mt-8 mb-10">
            <label htmlFor="username_field" className="text-white text-left">Username</label>
            <input
              type="text"
              id="username_field"
              className="nes-input is-dark w-full"
              placeholder="Enter your username"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              disabled={isCreatingRoom}
            />
          </div>

          <div className="mt-8 flex flex-col items-center space-y-6" tabIndex={-1}>
            <label className="flex items-center space-x-4 cursor-pointer">
              <input
                type="radio"
                className="nes-radio"
                name="room-action"
                tabIndex={0}
                disabled={isCreatingRoom}
                onClick={handleCreateRoom}
              />
              <span className={`font-press-start text-white text-sm ${isCreatingRoom ? 'opacity-50' : ''}`}>
                {isCreatingRoom ? 'Creating...' : 'Create room'}
              </span>
            </label>

            <label className="flex items-center space-x-4 is-pointer">
              <input
                type="radio"
                className="nes-radio"
                name="room-action"
                tabIndex={0}
                disabled={isCreatingRoom}
                onClick={handleJoinRoom}
              />
              <span className={`font-press-start text-white text-sm ${isCreatingRoom ? 'opacity-50' : ''}`}>
                Join room
              </span>
            </label>
          </div>
        </div>
      </div>
      <div className="fixed bottom-16 left-20 z-50">
        <GameInfo />
      </div>
    </div>
  )
}