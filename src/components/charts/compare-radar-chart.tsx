'use client'

import { useState, useEffect } from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { District } from '@/types'

interface CompareRadarChartProps {
  distA: District
  distB: District
}

export function CompareRadarChart({ distA, distB }: CompareRadarChartProps) {
  const [mounted, setMounted] = useState(false)
  const [metricMode, setMetricMode] = useState<'problem' | 'budget'>('problem')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-[340px] w-full flex items-center justify-center text-xs text-muted-foreground animate-pulse">
        Memuat Radar Interaktif...
      </div>
    )
  }

  const data = [
    {
      sector: 'Infrastruktur',
      [distA.name]: metricMode === 'problem' ? distA.infra_problem_pct : distA.budget_infra_pct,
      [distB.name]: metricMode === 'problem' ? distB.infra_problem_pct : distB.budget_infra_pct,
      fullMark: 100,
    },
    {
      sector: 'Kesehatan',
      [distA.name]: metricMode === 'problem' ? distA.health_problem_pct : distA.budget_health_pct,
      [distB.name]: metricMode === 'problem' ? distB.health_problem_pct : distB.budget_health_pct,
      fullMark: 100,
    },
    {
      sector: 'Pendidikan',
      [distA.name]: metricMode === 'problem' ? distA.edu_problem_pct : distA.budget_edu_pct,
      [distB.name]: metricMode === 'problem' ? distB.edu_problem_pct : distB.budget_edu_pct,
      fullMark: 100,
    },
    {
      sector: 'Sosial',
      [distA.name]: metricMode === 'problem' ? distA.social_problem_pct : distA.budget_social_pct,
      [distB.name]: metricMode === 'problem' ? distB.social_problem_pct : distB.budget_social_pct,
      fullMark: 100,
    },
  ]

  return (
    <div className="flex flex-col justify-between h-full space-y-4">
      {/* Metric Mode Switcher */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Matriks Radar Poligon 4 Sektor
          </span>
          <span className="text-[11px] text-muted-foreground font-mono">
            {metricMode === 'problem' ? 'Kebutuhan BPS (%)' : 'Alokasi APBD (%)'}
          </span>
        </div>
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border text-[11px] font-semibold">
          <button
            onClick={() => setMetricMode('problem')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              metricMode === 'problem'
                ? 'bg-card text-foreground shadow-sm font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Masalah (BPS)
          </button>
          <button
            onClick={() => setMetricMode('budget')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              metricMode === 'budget'
                ? 'bg-card text-foreground shadow-sm font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Alokasi (APBD)
          </button>
        </div>
      </div>

      {/* Recharts Radar (Flexible Height) */}
      <div className="w-full flex-1 min-h-[380px] flex items-center justify-center py-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="var(--border)" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="sector"
              tick={{ fill: 'var(--foreground)', fontSize: 11, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 60]}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 9 }}
              stroke="var(--border)"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-lg text-xs space-y-1.5">
                      <p className="font-bold text-foreground">
                        {payload[0]?.payload?.sector}
                      </p>
                      {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                            <span
                              className="size-2 rounded-full"
                              style={{ backgroundColor: entry.color }}
                            />
                            {entry.name}:
                          </span>
                          <span className="font-mono font-bold text-foreground">
                            {entry.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                }
                return null
              }}
            />
            <Radar
              name={distA.name}
              dataKey={distA.name}
              stroke="#1668e8"
              fill="#1668e8"
              fillOpacity={0.35}
              strokeWidth={2}
            />
            <Radar
              name={distB.name}
              dataKey={distB.name}
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Footer (Pinned to bottom) */}
      <div className="flex items-center justify-center gap-6 text-xs font-semibold pt-3 border-t border-border/60">
        <span className="flex items-center gap-2 text-primary font-bold">
          <span className="size-2.5 rounded-sm bg-[#1668e8]" />
          {distA.name}
        </span>
        <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
          <span className="size-2.5 rounded-sm bg-[#10b981]" />
          {distB.name}
        </span>
      </div>
    </div>
  )
}

