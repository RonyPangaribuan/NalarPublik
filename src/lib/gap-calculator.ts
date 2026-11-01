import { District, GapStatus, SectorKey } from '@/types'

export interface SectorGapResult {
  sector: SectorKey
  label: string
  problemPct: number
  budgetPct: number
  gap: number
}

export const SECTORS: { key: SectorKey; label: string; icon: string }[] = [
  { key: 'infra', label: 'Infrastruktur', icon: 'Road' },
  { key: 'health', label: 'Kesehatan', icon: 'Heart' },
  { key: 'education', label: 'Pendidikan', icon: 'GraduationCap' },
  { key: 'social', label: 'Sosial & Ekonomi', icon: 'Users' },
]

export function calculateSectorGaps(d: District): SectorGapResult[] {
  return [
    {
      sector: 'infra',
      label: 'Infrastruktur',
      problemPct: d.infra_problem_pct,
      budgetPct: d.budget_infra_pct,
      gap: Number((d.infra_problem_pct - d.budget_infra_pct).toFixed(1)),
    },
    {
      sector: 'health',
      label: 'Kesehatan',
      problemPct: d.health_problem_pct,
      budgetPct: d.budget_health_pct,
      gap: Number((d.health_problem_pct - d.budget_health_pct).toFixed(1)),
    },
    {
      sector: 'education',
      label: 'Pendidikan',
      problemPct: d.edu_problem_pct,
      budgetPct: d.budget_edu_pct,
      gap: Number((d.edu_problem_pct - d.budget_edu_pct).toFixed(1)),
    },
    {
      sector: 'social',
      label: 'Sosial & Ekonomi',
      problemPct: d.social_problem_pct,
      budgetPct: d.budget_social_pct,
      gap: Number((d.social_problem_pct - d.budget_social_pct).toFixed(1)),
    },
  ]
}

export function calculateOverallGap(d: District): number {
  const gaps = calculateSectorGaps(d)
  const sumPositive = gaps.reduce((acc, curr) => acc + Math.max(0, curr.gap), 0)
  return Number((sumPositive / 4).toFixed(2))
}

export function calculateGapStatus(d: District, activeSector?: SectorKey): GapStatus {
  const gaps = calculateSectorGaps(d)

  if (activeSector) {
    const target = gaps.find((g) => g.sector === activeSector)
    if (!target) return 'PROPORTIONAL'
    if (target.gap >= 20) return 'CRITICAL'
    if (target.gap >= 10) return 'WARNING'
    return 'PROPORTIONAL'
  }

  const overall = calculateOverallGap(d)
  const maxGap = Math.max(...gaps.map((g) => g.gap))

  if (maxGap >= 20 || overall >= 15) return 'CRITICAL'
  if (maxGap >= 10) return 'WARNING'
  return 'PROPORTIONAL'
}

// Swiss / Linear Technical Status Styling (eliminating pastel neon pill tropes)
export function getStatusColor(status: GapStatus): {
  badge: string
  dot: string
  text: string
  bg: string
  border: string
  hex: string
  label: string
} {
  switch (status) {
    case 'CRITICAL':
      return {
        badge: 'bg-muted/70 text-foreground border border-border font-mono',
        dot: 'bg-rose-500',
        text: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-muted',
        border: 'border-border',
        hex: '#df3b3b',
        label: 'KRITIS',
      }
    case 'WARNING':
      return {
        badge: 'bg-muted/70 text-foreground border border-border font-mono',
        dot: 'bg-amber-500',
        text: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-muted',
        border: 'border-border',
        hex: '#d99216',
        label: 'WASPADA',
      }
    case 'PROPORTIONAL':
    default:
      return {
        badge: 'bg-muted/70 text-foreground border border-border font-mono',
        dot: 'bg-emerald-500',
        text: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-muted',
        border: 'border-border',
        hex: '#1d9b64',
        label: 'SELARAS',
      }
  }
}
