import { Outlet, createRootRoute } from '@tanstack/react-router'
import App from '../App'

export const rootRoute = createRootRoute({
  component: rootLayout,
})

function rootLayout() {
  return (
    <>
      <App />
      <Outlet />
    </>
  )
}