'use client'

import { create } from 'zustand'
import { combine, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import type { UserProfile } from './userProfile'

type UserStoreState = {
  profile: UserProfile
  actions: {
    setProfile: (profile: UserProfile) => void
    clearProfile: () => void
    setProfileImage: (imageUrl: string) => void
    setNickname: (nickname: string) => void
    setLevel: (level: number) => void
    setActiveCardCount: (activeCardCount: number) => void
    setConsecutiveDays: (consecutiveDays: number) => void
    setWinCount: (winCount: number) => void
    getProfile: () => UserProfile
  }
}

const createInitialProfile = (): UserProfile => ({
  nickname: '',
  profileImageUrl: '',
  level: 0,
  activeCardCount: 0,
  consecutiveDays: 1,
  winCount: 0,
})

export const useUserStore = create<UserStoreState>()(
  persist(
    immer(
      combine({ profile: createInitialProfile() }, (set, get) => ({
        actions: {
          setProfile: (profile) => {
            set((state) => {
              state.profile = profile
            })
          },
          clearProfile: () => {
            set((state) => {
              state.profile = createInitialProfile()
            })
          },
          setProfileImage: (imageUrl) => {
            set((state) => {
              state.profile.profileImageUrl = imageUrl
            })
          },
          setNickname: (nickname) => {
            set((state) => {
              state.profile.nickname = nickname
            })
          },
          setLevel: (level) => {
            set((state) => {
              state.profile.level = level
            })
          },
          setActiveCardCount: (activeCardCount) => {
            set((state) => {
              state.profile.activeCardCount = activeCardCount
            })
          },
          setConsecutiveDays: (consecutiveDays) => {
            set((state) => {
              state.profile.consecutiveDays = consecutiveDays
            })
          },
          setWinCount: (winCount) => {
            set((state) => {
              state.profile.winCount = winCount
            })
          },
          getProfile: () => get().profile,
        },
      })),
    ),
    {
      name: 'user-store',
      version: 1,
      partialize: (state) => ({ profile: state.profile }),
    },
  ),
)

// selectors
export const useProfile = () => useUserStore((s) => s.profile)
export const useSetProfile = () => useUserStore((s) => s.actions.setProfile)
export const useClearProfile = () => useUserStore((s) => s.actions.clearProfile)
export const useNickname = () => useUserStore((s) => s.profile.nickname)
export const useProfileImage = () => useUserStore((s) => s.profile.profileImageUrl)
