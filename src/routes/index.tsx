import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'
import { Link } from '@tanstack/react-router'
import Squares from '../components/Squares';
import Login from '../components/Login';

export const indexRoute = createRoute({
  component: IndexPage,
  getParentRoute: () => rootRoute,
  path: '/',
})

function IndexPage() {
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
        <Login /> 
      </div>
    </div>
  )
}