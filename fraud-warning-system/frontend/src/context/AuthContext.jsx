import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

const DEMO_USERS = {
  admin:        { id: 'admin', username: 'admin', name: 'Admin User',   role: 'admin',       email: 'admin@fraudwatch.com',  dept: 'Security Operations',  password: 'admin123'   },
  analyst:      { id: 'analyst', username: 'analyst', name: 'Sarah Chen', role: 'analyst',     email: 'sarah@fraudwatch.com',  dept: 'Fraud Investigation',  password: 'analyst123' },
  investigator: { id: 'inv', username: 'investigator', name: 'James Wilson', role: 'investigator', email: 'james@fraudwatch.com', dept: 'Risk Management', password: 'invest123' },
}

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('fw_user')
    if (saved) { try { setUser(JSON.parse(saved)) } catch {} }
    setLoading(false)
  }, [])

  const login = useCallback(async (username, password) => {
    // Check local demo accounts
    const demo = DEMO_USERS[username]
    if (demo && demo.password === password) {
      const u = { id: demo.id, username: demo.username, name: demo.name, role: demo.role, email: demo.email, dept: demo.dept }
      setUser(u)
      localStorage.setItem('fw_user', JSON.stringify(u))
      return u
    }
    // Try real backend (optional)
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.token && data.user) {
          localStorage.setItem('fw_token', data.token)
          localStorage.setItem('fw_user', JSON.stringify(data.user))
          setUser(data.user)
          return data.user
        }
      }
    } catch {}
    throw new Error('Invalid credentials')
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('fw_user')
    localStorage.removeItem('fw_token')
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
