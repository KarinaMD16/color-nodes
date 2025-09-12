import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface UserContextType {
  id: number | null
  username: string
  setUser: (id: number, name: string) => void
  clearUser: () => void
}

// ...interfaces igual

const UserContext = createContext<UserContextType | undefined>(undefined)

const LOCAL_KEY = 'colorNodes_user'
const isValidId = (v: unknown) => Number.isInteger(v) && Number(v) > 0

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [id, setId] = useState<number | null>(null)
  const [username, setUsername] = useState('')

  // 1) Carga saneando: si viene -1/0/NaN, no lo aceptes
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY)
    if (!saved) return
    try {
      const parsed = JSON.parse(saved) as { id: unknown; username: unknown }
      const loadedId = Number(parsed?.id)
      const loadedName = String(parsed?.username ?? '')
      if (isValidId(loadedId) && loadedName) {
        console.log('📂 Loaded user from storage:', { loadedId, loadedName })
        setId(loadedId)
        setUsername(loadedName)
      } else {
        console.warn('⚠️ Invalid stored user, clearing', parsed)
        localStorage.removeItem(LOCAL_KEY)
      }
    } catch (e) {
      console.warn('⚠️ Failed to parse saved user data:', e)
      localStorage.removeItem(LOCAL_KEY)
    }
  }, [])

  const setUser = (newId: number, newName: string) => {
    // 2) No permitas persistir ids inválidos
    if (!isValidId(newId)) {
      console.warn('🚫 setUser: invalid id, skipping persist', { newId, newName })
      // Aún así refleja nombre en memoria si quieres:
      setUsername(newName ?? '')
      setId(null)
      return
    }

    console.log('👤 Setting user:', { newId, newName })
    setId(newId)
    setUsername(newName)
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ id: newId, username: newName }))
  }

  const clearUser = () => {
    console.log('🗑️ Clearing user')
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
