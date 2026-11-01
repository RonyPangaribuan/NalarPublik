'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RoleMode } from '@/types'

interface RoleStore {
  role: RoleMode
  setRole: (role: RoleMode) => void
  toggleRole: () => void
}

/**
 * Zustand store untuk Quick Role Switcher (Mode Warga ↔ Mode Admin).
 *
 * - Nilai awal: 'public' (Mode Warga)
 * - Disimpan di localStorage ('nalarpublik-role') agar tidak reset saat refresh
 * - Tidak ada autentikasi — ini sandbox/demo sesuai spesifikasi PRD §2
 */
export const useRoleStore = create<RoleStore>()(
  persist(
    (set, get) => ({
      role: 'public',
      setRole: (role) => set({ role }),
      toggleRole: () =>
        set({ role: get().role === 'public' ? 'admin' : 'public' }),
    }),
    {
      name: 'nalarpublik-role',
    },
  ),
)

