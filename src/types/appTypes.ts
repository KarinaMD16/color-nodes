export interface UserContextType {
  id: number | null
  username: string
  setUser: (id: number, name: string) => void
  clearUser: () => void
}

export interface PantallaFondoProps {
  texto: string
  subtexto?: string
  children?: React.ReactNode
  overlay?: 'dark' | 'none' 
}
