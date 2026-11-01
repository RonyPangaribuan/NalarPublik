'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface BudgetDonutChartProps {
  allocations: {
    infra: number
    health: number
    education: number
    social: number
  }
}

const COLORS = [
  '#1668e8', // Infrastruktur - Blue
  '#10b981', // Kesehatan - Emerald
  '#f59e0b', // Pendidikan - Amber
  '#8b5cf6', // Sosial - Violet
]

export function BudgetDonutChart({ allocations }: BudgetDonutChartProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const total = allocations.infra + allocations.health + allocations.education + allocations.social
  const isValid = total === 100

  const data = [
    { name: 'Infrastruktur', value: allocations.infra, color: COLORS[0] },
    { name: 'Kesehatan', value: allocations.health, color: COLORS[1] },
    { name: 'Pendidikan', value: allocations.education, color: COLORS[2] },
    { name: 'Sosial & Ekonomi', value: allocations.social, color: COLORS[3] },
  ]

  if (!mounted) {
    return (
      <div className="h-[220px] w-full flex items-center justify-center text-xs text-muted-foreground animate-pulse">
        Memuat Donut Grafik...
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative h-[210px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const entry = payload[0]
                  return (
                    <div className="bg-card/95 backdrop-blur-md border border-border px-3 py-1.5 rounded-xl shadow-lg text-xs flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ backgroundColor: entry.payload.color }} />
                      <span className="font-semibold text-foreground">{entry.name}:</span>
                      <span className="font-mono font-bold text-foreground">{entry.value}%</span>
                    </div>
                  )
                }
                return null
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              animationDuration={400}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span
            className={`text-2xl font-black font-mono leading-none ${
              isValid ? 'text-emerald-500' : total > 100 ? 'text-rose-500' : 'text-amber-500'
            }`}
          >
            {total}%
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">
            {isValid ? 'Seimbang' : total > 100 ? 'Kelebihan' : 'Sisa Kuota'}
          </span>
        </div>
      </div>

      {/* Mini Legend Slices */}
      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-1.5 rounded-lg bg-muted/40 border border-border">
            <span className="flex items-center gap-1.5 text-muted-foreground truncate">
              <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="font-mono font-bold text-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

