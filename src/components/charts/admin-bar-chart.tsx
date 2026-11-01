'use client'

import { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { District } from '@/types'

interface AdminBarChartProps {
  district: District
  avgAspirations: {
    infra: number
    health: number
    edu: number
    social: number
  }
}

export function AdminBarChart({ district, avgAspirations }: AdminBarChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-[340px] w-full flex items-center justify-center text-xs text-muted-foreground animate-pulse">
        Memuat Grafik Batang Analitik...
      </div>
    )
  }

  const data = [
    {
      sector: 'Infrastruktur',
      'Masalah Lapangan (BPS)': district.infra_problem_pct,
      'Alokasi APBD': district.budget_infra_pct,
      'Aspirasi Warga': Number(avgAspirations.infra.toFixed(1)),
    },
    {
      sector: 'Kesehatan',
      'Masalah Lapangan (BPS)': district.health_problem_pct,
      'Alokasi APBD': district.budget_health_pct,
      'Aspirasi Warga': Number(avgAspirations.health.toFixed(1)),
    },
    {
      sector: 'Pendidikan',
      'Masalah Lapangan (BPS)': district.edu_problem_pct,
      'Alokasi APBD': district.budget_edu_pct,
      'Aspirasi Warga': Number(avgAspirations.edu.toFixed(1)),
    },
    {
      sector: 'Sosial',
      'Masalah Lapangan (BPS)': district.social_problem_pct,
      'Alokasi APBD': district.budget_social_pct,
      'Aspirasi Warga': Number(avgAspirations.social.toFixed(1)),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="sector"
              tick={{ fill: 'var(--foreground)', fontSize: 11, fontWeight: 600 }}
              stroke="var(--border)"
            />
            <YAxis
              unit="%"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
              stroke="var(--border)"
              domain={[0, 60]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card/95 backdrop-blur-md border border-border p-3.5 rounded-xl shadow-xl text-xs space-y-2 min-w-[200px]">
                      <p className="font-bold text-foreground border-b border-border pb-1">
                        Sektor: {payload[0]?.payload?.sector}
                      </p>
                      {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-3">
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
            <Bar
              dataKey="Masalah Lapangan (BPS)"
              fill="#1668e8"
              radius={[4, 4, 0, 0]}
              animationDuration={500}
            />
            <Bar
              dataKey="Alokasi APBD"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              animationDuration={600}
            />
            <Bar
              dataKey="Aspirasi Warga"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
              animationDuration={700}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-muted-foreground pt-1">
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded bg-[#1668e8]" />
          Masalah Lapangan (BPS)
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded bg-[#10b981]" />
          Alokasi APBD
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded bg-[#f59e0b]" />
          Rata-rata Aspirasi Warga
        </span>
      </div>
    </div>
  )
}

