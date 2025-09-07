import { createRouter } from '@tanstack/react-router'
import { rootRoute } from './routes/__root'
import { indexRoute } from './routes/index'
import { route as roomCodeRoute } from './routes/room/$code'
import { joinRoute } from './routes/join'
import { playRoute } from './routes/room/$code.play'

// Create the route tree using the imported routes
const routeTree = rootRoute.addChildren([
  indexRoute,
  roomCodeRoute,
  joinRoute,
  playRoute
])

// Create the router using the route tree
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default router
