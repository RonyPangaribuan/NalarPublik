'use client'

import { cn } from '@/lib/utils'

const ICON_PATH =
  'M8 66L23 33C25 28.5 30.5 28.5 32.5 33L41 51L55 21C61 9.5 73.5 6 87 8C104 10.5 114 24.5 112 41.5C110 56.5 97 65.5 81 64.5L74 64C72.5 71 67.5 75.5 61 78V29L46 60C44 64.5 38.5 64.5 36.5 60L27.5 42L17 66H8ZM87 20C96.4 20 104 27.6 104 37C104 46.4 96.4 54 87 54C83 54 79.3 52.7 76.3 50.5L68.5 54.5L71.2 46C70.4 43.2 70 40.2 70 37C70 27.6 77.6 20 87 20Z'

export function Logo({
  size = 'md',
  variant = 'default',
  showText = true,
}: {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'light'
  showText?: boolean
}) {
  const iconH = size === 'sm' ? 24 : size === 'lg' ? 36 : 28
  const iconW = Math.round(iconH * (120 / 88))
  const textClass = size === 'sm' ? 'text-[18px]' : size === 'lg' ? 'text-[24px]' : 'text-[20px]'
  const isLight = variant === 'light'

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      {/* Official Vector Icon (Khusus Ikon Saja) */}
      <svg
        aria-hidden="true"
        width={iconW}
        height={iconH}
        viewBox="0 0 120 88"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-colors"
      >
        <path
          fillRule="evenodd"
          d={ICON_PATH}
          className={isLight ? 'fill-[#9BC5DF]' : 'fill-[#3B66E4] dark:fill-[#9BC5DF]'}
        />
      </svg>

      {/* Official Typography (Full Logo Text) */}
      {showText && (
        <span
          className={cn(
            'tracking-tight leading-none transition-colors flex items-center',
            isLight ? 'text-white' : 'text-[#0F172A] dark:text-white',
            textClass
          )}
          style={{
            fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
            letterSpacing: '-0.03em',
          }}
        >
          <span className="font-extrabold">Nalar</span>
          <span className="font-normal">Publik</span>
        </span>
      )}
    </div>
  )
}
