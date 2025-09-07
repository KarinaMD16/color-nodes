import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface UserContextType {
  id: number | null
  username: string
  setUser: (id: number, name: string) => void
  clearUser: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)
//  corregir (orlando)
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [id, setId] = useState<number | null>(null)
  const [username, setUsername] = useState('')

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('colorNodes_user')
    if (savedUser) {
      try {
        const { id: savedId, username: savedUsername } = JSON.parse(savedUser)
        console.log('📂 Loaded user from storage:', { savedId, savedUsername })
        setId(savedId)
        setUsername(savedUsername)
      } catch (e) {
        console.warn('⚠️ Failed to parse saved user data:', e)
        localStorage.removeItem('colorNodes_user')
      }
    }
  }, [])

  const setUser = (newId: number, newName: string) => {
    console.log('👤 Setting user:', { newId, newName })
    setId(newId)
    setUsername(newName)

    // Guardar en localStorage
    localStorage.setItem('colorNodes_user', JSON.stringify({
      id: newId,
      username: newName
    }))
  }

  const clearUser = () => {
    console.log('🗑️ Clearing user')
    setId(null)
    setUsername('')
    localStorage.removeItem('colorNodes_user')
  }

  // Debug: log cambios
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
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be inside UserProvider')
  return context
}