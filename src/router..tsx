import { createRouter } from '@tanstack/react-router'
import { rootRoute } from './routes/__root'
import { indexRoute } from './routes/index'
import { route as roomCodeRoute } from './routes/room/$code'

const router = createRouter({
  routeTree: rootRoute.addChildren([
    indexRoute,
    roomCodeRoute,
  ]),
})

export default router
