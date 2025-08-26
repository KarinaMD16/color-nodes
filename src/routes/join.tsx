import React from 'react'
import { createRoute, Link } from '@tanstack/react-router'
import { rootRoute } from './__root'

export const joinRoute = createRoute({
  component: JoinPage,
  getParentRoute: () => rootRoute,
  path: '/join',
})

function JoinPage() {
  const [roomCode, setRoomCode] = React.useState('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Join a Room
        </h1>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-1">
              Room Code
            </label>
            <input
              type="text"
              id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter room code"
              maxLength={8}
              autoComplete="off"
              autoFocus
            />
          </div>
          
          <Link
            to="/room/$code"
            params={{ code: roomCode || 'default' }}
            className={`w-full block text-center px-6 py-3 font-medium rounded-lg transition-colors duration-200 ${
              roomCode
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!roomCode}
          >
            Join Room
          </Link>
          
          <Link
            to="/"
            className="block text-center text-indigo-600 hover:text-indigo-800 mt-2"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
