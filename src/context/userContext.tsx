import { UserContextType } from '@/types/appTypes'
import { createContext, useContext, useState, ReactNode, useEffect } from 'react'


const UserContext = createContext<UserContextType | undefined>(undefined)

const LOCAL_KEY = 'colorNodes_user'
const isValidId = (v: unknown) => Number.isInteger(v) && Number(v) > 0

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [id, setId] = useState<number | null>(null)
  const [username, setUsername] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY)
    if (!saved) return
    try {
      const parsed = JSON.parse(saved) as { id: unknown; username: unknown }
      const loadedId = Number(parsed?.id)
      const loadedName = String(parsed?.username ?? '')
      if (isValidId(loadedId) && loadedName) {
        setId(loadedId)
        setUsername(loadedName)
      } else {
        localStorage.removeItem(LOCAL_KEY)
      }
    } catch (e) {
      localStorage.removeItem(LOCAL_KEY)
    }
  }, [])

  const setUser = (newId: number, newName: string) => {
    if (!isValidId(newId)) {
      setUsername(newName ?? '')
      setId(null)
      return
    }

    setId(newId)
    setUsername(newName)
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ id: newId, username: newName }))
  }

  const clearUser = () => {
    setId(null)
    setUsername('')
    localStorage.removeItem(LOCAL_KEY)
  }

  useEffect(() => {
    console.log('👤 User state changed:', { id, username })
  }, [id, username])

  return (
    <UserContext.Provider value={{ id, username, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be inside UserProvider')
  return ctx
}
