'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CitizenAspirationItem {
  id: string
  district_id: string
  district_name: string
  author: string
  avatar: string
  avatarBg: string
  alloc_infra_pct: number
  alloc_health_pct: number
  alloc_edu_pct: number
  alloc_social_pct: number
  notes: string
  timeAgo: string
  created_at?: string
}

export const INITIAL_CITIZEN_SUBMISSIONS: CitizenAspirationItem[] = [
  {
    id: 'sub-hab-1',
    district_id: 'habinsaran',
    district_name: 'Kecamatan Habinsaran',
    author: 'Warga Desa Lumban Rau',
    avatar: 'LR',
    avatarBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    alloc_infra_pct: 50,
    alloc_health_pct: 20,
    alloc_edu_pct: 15,
    alloc_social_pct: 15,
    notes: 'Jalan penghubung antar desa di Habinsaran banyak yang longsor dan rusak berat. Truk pengangkut hasil tani sering terbalik saat musim hujan.',
    timeAgo: '15 menit lalu',
  },
  {
    id: 'sub-hab-2',
    district_id: 'habinsaran',
    district_name: 'Kecamatan Habinsaran',
    author: 'Warga Parsoburan',
    avatar: 'PS',
    avatarBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    alloc_infra_pct: 45,
    alloc_health_pct: 25,
    alloc_edu_pct: 15,
    alloc_social_pct: 15,
    notes: 'Mohon prioritas pengaspalan jalan usaha tani dataran tinggi dan tambahan tenaga perawat puskesmas pembantu desa.',
    timeAgo: '1 jam lalu',
  },
  {
    id: 'sub-hab-3',
    district_id: 'habinsaran',
    district_name: 'Kecamatan Habinsaran',
    author: 'Warga Borbor Julu',
    avatar: 'BJ',
    avatarBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    alloc_infra_pct: 55,
    alloc_health_pct: 15,
    alloc_edu_pct: 15,
    alloc_social_pct: 15,
    notes: 'Jembatan kayu antar dusun sudah rapuh, anak sekolah harus memutar 5 kilometer tiap hari menyeberang sungai.',
    timeAgo: '3 jam lalu',
  },
  {
    id: 'sub-por-1',
    district_id: 'porsea',
    district_name: 'Kecamatan Porsea',
    author: 'Warga Desa Siruar',
    avatar: 'SR',
    avatarBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    alloc_infra_pct: 25,
    alloc_health_pct: 45,
    alloc_edu_pct: 15,
    alloc_social_pct: 15,
    notes: 'Program penanganan stunting dan gizi balita di Porsea pesisir perlu ditingkatkan dan diberi susu formula serta PMT rutin.',
    timeAgo: '45 menit lalu',
  },
  {
    id: 'sub-por-2',
    district_id: 'porsea',
    district_name: 'Kecamatan Porsea',
    author: 'Warga Patane I',
    avatar: 'PT',
    avatarBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    alloc_infra_pct: 30,
    alloc_health_pct: 35,
    alloc_edu_pct: 20,
    alloc_social_pct: 15,
    notes: 'Puskesmas rawat inap Porsea butuh alat USG dan timbangan antropometri digital terkalibrasi untuk posyandu balita.',
    timeAgo: '2 jam lalu',
  },
  {
    id: 'sub-lag-1',
    district_id: 'laguboti',
    district_name: 'Kecamatan Laguboti',
    author: 'Warga Desa Sitoluama',
    avatar: 'ST',
    avatarBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    alloc_infra_pct: 30,
    alloc_health_pct: 20,
    alloc_edu_pct: 35,
    alloc_social_pct: 15,
    notes: 'Renovasi ruang kelas SD negeri yang plafonnya jebol dan penambahan sarana komputer/internet untuk siswa desa.',
    timeAgo: '1 jam lalu',
  },
  {
    id: 'sub-lag-2',
    district_id: 'laguboti',
    district_name: 'Kecamatan Laguboti',
    author: 'Warga Pasar Laguboti',
    avatar: 'PL',
    avatarBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    alloc_infra_pct: 25,
    alloc_health_pct: 20,
    alloc_edu_pct: 35,
    alloc_social_pct: 20,
    notes: 'Bantuan beasiswa anak petani berprestasi dan perbaikan sarana sanitasi MCK sekolah dasar pelosok.',
    timeAgo: '4 jam lalu',
  },
  {
    id: 'sub-bal-1',
    district_id: 'balige',
    district_name: 'Kecamatan Balige',
    author: 'Warga Sangkar Nihuta',
    avatar: 'SN',
    avatarBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    alloc_infra_pct: 35,
    alloc_health_pct: 25,
    alloc_edu_pct: 20,
    alloc_social_pct: 20,
    notes: 'Normalisasi saluran drainase perkotaan Balige agar tidak banjir saat hujan lebat dan pengelolaan sampah pasar tradisional.',
    timeAgo: '2 jam lalu',
  },
  {
    id: 'sub-bal-2',
    district_id: 'balige',
    district_name: 'Kecamatan Balige',
    author: 'Warga Lumban Silintong',
    avatar: 'LS',
    avatarBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    alloc_infra_pct: 35,
    alloc_health_pct: 20,
    alloc_edu_pct: 20,
    alloc_social_pct: 25,
    notes: 'Penerangan lampu jalan umum menuju sentra pantai Danau Toba dan bantuan bibit kopi arabika dataran tinggi.',
    timeAgo: '5 jam lalu',
  },
]

interface SubmissionsStore {
  submissions: CitizenAspirationItem[]
  addSubmission: (sub: Omit<CitizenAspirationItem, 'id' | 'timeAgo'>) => void
  resetToDefault: () => void
}

export const useSubmissionsStore = create<SubmissionsStore>()(
  persist(
    (set) => ({
      submissions: INITIAL_CITIZEN_SUBMISSIONS,
      addSubmission: (newSub) =>
        set((state) => ({
          submissions: [
            {
              ...newSub,
              id: `sub-user-${Date.now()}`,
              timeAgo: 'Baru saja',
            },
            ...state.submissions,
          ],
        })),
      resetToDefault: () => set({ submissions: INITIAL_CITIZEN_SUBMISSIONS }),
    }),
    {
      name: 'nalarpublik-citizen-submissions',
    },
  ),
)

