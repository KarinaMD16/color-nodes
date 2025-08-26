import React from 'react'
import { createRoute, Link, useParams } from '@tanstack/react-router'
import { rootRoute } from '../__root'

export const route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/room/$code',
  component: RoomPage,
})

function RoomPage() {
  const { code } = useParams({ from: route.id })
  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Color Nodes</h1>
          <Link to="/" className="text-gray-300 hover:text-white">
            Leave Room
          </Link>
        </header>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Room Code</h2>
            <div className="flex items-center gap-2">
              <code className="bg-black/30 px-4 py-2 rounded-lg text-xl font-mono">
                {code}
              </code>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Share this code</h3>
              <p className="text-sm text-gray-300">
                Invite others to join this room by sharing the room code above.
              </p>
            </div>
            
            <div className="bg-white/5 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Start collaborating</h3>
              <p className="text-sm text-gray-300">
                Once others join, you can start collaborating in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}