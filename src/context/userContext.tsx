import { createContext, useContext, useState, ReactNode } from 'react'

interface UserContextType {
  username: string
  setUsername: (name: string) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState('')
  return (
    <UserContext.Provider value={{ username, setUsername }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be inside UserProvider')
  return context
}
