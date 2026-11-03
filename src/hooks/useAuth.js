import { useCallback, useMemo, useState } from 'react'
import {
  createSalt,
  createUserId,
  hashPassword,
  loadAuthStore,
  saveAuthStore,
} from '../auth/storage'

function normalizeUsername(name) {
  return name.trim().toLowerCase()
}

export function useAuth() {
  const [store, setStore] = useState(loadAuthStore)

  const currentUser = useMemo(
    () => store.users.find((u) => u.id === store.currentUserId) || null,
    [store],
  )

  const persist = useCallback((next) => {
    setStore(next)
    saveAuthStore(next)
  }, [])

  const register = useCallback(
    async (username, password) => {
      const name = username.trim()
      const key = normalizeUsername(name)
      if (name.length < 2) return { ok: false, error: 'Nazwa musi mieć min. 2 znaki.' }
      if (password.length < 4) return { ok: false, error: 'Hasło musi mieć min. 4 znaki.' }
      if (store.users.some((u) => normalizeUsername(u.username) === key)) {
        return { ok: false, error: 'Taka nazwa użytkownika już istnieje.' }
      }

      const salt = createSalt()
      const passwordHash = await hashPassword(password, salt)
      const user = {
        id: createUserId(),
        username: name,
        salt,
        passwordHash,
        createdAt: Date.now(),
      }

      const next = {
        users: [...store.users, user],
        currentUserId: user.id,
      }
      persist(next)
      return { ok: true, user }
    },
    [store, persist],
  )

  const login = useCallback(
    async (username, password) => {
      const key = normalizeUsername(username)
      const user = store.users.find((u) => normalizeUsername(u.username) === key)
      if (!user) return { ok: false, error: 'Nieprawidłowa nazwa lub hasło.' }

      const passwordHash = await hashPassword(password, user.salt)
      if (passwordHash !== user.passwordHash) {
        return { ok: false, error: 'Nieprawidłowa nazwa lub hasło.' }
      }

      persist({ ...store, currentUserId: user.id })
      return { ok: true, user }
    },
    [store, persist],
  )

  const logout = useCallback(() => {
    persist({ ...store, currentUserId: null })
  }, [store, persist])

  return {
    currentUser,
    users: store.users,
    register,
    login,
    logout,
    isAuthenticated: Boolean(currentUser),
  }
}
