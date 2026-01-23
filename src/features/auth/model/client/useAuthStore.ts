'use client'

import { create } from 'zustand'

type AuthState = {
  accessToken: string | null
  setAccessToken: (token: string | null) => void
  clearAccessToken: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
  clearAccessToken: () => set({ accessToken: null }),
}))
