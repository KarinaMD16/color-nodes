import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import Squares from '../components/Squares';
import { usePostCreateRoom, usePostCreateUser } from '../hooks/userHooks';
import { useUser } from '../context/userContext';
import router from '../router';
import { useState } from 'react';

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

  const handleCreateRoom = () => {
    if (!inputUsername.trim()) {
      alert('Please enter a username')
      return
    }

    setIsCreatingRoom(true)
    console.log('🚀 Creating user first:', inputUsername)

    // Primero crear el usuario
    createUser(inputUsername, {
      onSuccess: (userData) => {
        console.log('✅ User created:', userData)
        
        // Establecer el usuario en el contexto
        const userId = userData.id || userData.userId
        if (userId) {
          setUser(userId, inputUsername)
        }

        // Ahora crear la sala con el usuario
        createRoom({ username: inputUsername }, {
          onSuccess: (roomData) => {
            console.log('✅ Room created:', roomData)
            
            const roomCode = roomData.code 
            if (!roomCode) {
              console.error('❌ No room code in response:', roomData)
              alert('Error: No room code received')
              setIsCreatingRoom(false)
              return
            }

            // Navegar a la sala
            router.navigate({
              to: '/room/$code',
              params: { code: roomCode }
            })
          },
          onError: (error) => {
            console.error('❌ Error creating room:', error)
            alert('Error creating room. Please try again.')
            setIsCreatingRoom(false)
          }
        })
      },
      onError: (error) => {
        console.error('❌ Error creating user:', error)
        alert('Error creating user. Please try again.')
        setIsCreatingRoom(false)
      }
    })
  }

  const handleJoinRoom = () => {
    if (!inputUsername.trim()) {
      alert('Please enter a username')
      return
    }

    // Para join, establecer username y navegar
    setUser(-1, inputUsername) // ID temporal
    router.navigate({ to: '/join' })
  }

  return (
    <div className="relative w-full min-h-screen bg-black">
      <div className="fixed inset-0 w-full h-full bg-black">
        <Squares
          speed={0.5}
          squareSize={40}
          direction='diagonal'
          borderColor='#297023'
          hoverFillColor='#5C5C5C'
        />
      </div>
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto p-6 text-center font-press-start">
          <h1 className="font-press-start text-3xl md:text-4xl mb-8 whitespace-nowrap">
            <span style={{ color: '#7F5CC1' }}>Color</span>{' '}
            <span style={{ color: '#C15CAE' }}>Nodes</span>
            <span style={{ color: '#B0C15C' }}>!</span>
          </h1>
          
          <div className="nes-field mt-8 mb-10">
            <label htmlFor="name_field" className="text-white text-left">Username</label>
            <input
              type="text"
              id="name_field"
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

            <label className="flex items-center space-x-4 cursor-pointer">
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
    </div>
  )
}