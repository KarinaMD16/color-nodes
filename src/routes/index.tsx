import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import Squares from '../components/Squares';
import { usePostCreateRoom } from '../hooks/userHooks';
import { useUser } from '../context/userContext';
import router from '../router';
import { postCreateRoom } from '@/services/userService';

export const indexRoute = createRoute({
  component: IndexPage,
  getParentRoute: () => rootRoute,
  path: '/',
})

function IndexPage() {
  const mutate = usePostCreateRoom()
  // corregir (orlando)
  const { setUser, id, username } = useUser()

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
              defaultValue={username} // Pre-fill if user already set
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
                onClick={async () => {
                  const input = document.getElementById('name_field') as HTMLInputElement
                  const inputUsername = input?.value?.trim()
                  if (!inputUsername) {
                    alert('Please enter a username')
                    return
                  }

                  console.log('🚀 Creating room with username:', inputUsername)

                  try {
                    // ⛳️ Espera la respuesta del backend - debe incluir userId
                    const res: any = await postCreateRoom({ username: inputUsername })

                    console.log('✅ Create room response:', res)

                    // El backend debe devolver tanto roomCode como userId
                    const roomCode = res?.roomCode ?? res?.code
                    const userId = res?.userId ?? res?.id ?? res?.leaderId

                    if (!roomCode) {
                      console.error('❌ No roomCode in response:', res)
                      alert('Error: No room code received')
                      return
                    }

                    if (!userId) {
                      console.error('❌ No userId in response:', res)
                      alert('Error: No user ID received')
                      return
                    }

                    // ✅ Ahora sí tenemos el ID real del usuario
                    console.log('👤 Setting user:', userId, inputUsername)
                    setUser(userId, inputUsername)

                    // Navigate to the game
                    router.navigate({ to: '/room/$code/play', params: { code: roomCode } })
                  } catch (e) {
                    console.error('❌ Error creating room:', e)
                    alert('Error creating room. Please try again.')
                  }
                }}
              />
              <span className="font-press-start text-white text-sm">Create room</span>
            </label>

            <label className="flex items-center space-x-4 is-pointer">
              <input
                type="radio"
                className="nes-radio"
                name="room-action"
                tabIndex={0}
                onClick={() => {
                  const input = document.getElementById('name_field') as HTMLInputElement
                  const inputUsername = input?.value?.trim()

                  if (!inputUsername) {
                    alert('Please enter a username')
                    return
                  }

                  // Para join, también necesitarás el ID del usuario después del join
                  // Por ahora, establecemos un ID temporal
                  console.log('👤 Setting temporary user for join:', inputUsername)
                  setUser(-1, inputUsername) // ID temporal, se actualizará al hacer join
                  router.navigate({ to: '/join' })
                }}
              />
              <span className="font-press-start text-white text-sm">Join room</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}