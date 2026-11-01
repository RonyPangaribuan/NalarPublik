'use client'

// NalarPublik Logo — Map silhouette with "NP" monogram (matches reference design)
export function Logo({
  size = 'md',
  variant = 'default',
}: {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'light'
}) {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 40 : 32
  const textClass =
    size === 'sm'
      ? 'text-[15px]'
      : size === 'lg'
        ? 'text-[22px]'
        : 'text-[18px]'

  const isLight = variant === 'light'

  return (
    <div className="flex items-center gap-2 select-none">
      <svg
        aria-hidden="true"
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Land / island silhouette */}
        <path
          d="M6.6 3.8 19 2.7l7.1 4.1 2.1 9.7-4.5 8.1-7.8 1.2-5.3 3.7.7-4.8-6.7-3.8-1-9.8 3-7.3Z"
          fill={isLight ? '#ffffff' : '#1668e8'}
        />
        {/* NP monogram */}
        <path
          d="M8.2 20V10.3l6.8 9.5v-9.5h4.3c3.1 0 4.8 1.5 4.8 4s-1.7 4-4.8 4H15"
          stroke={isLight ? '#1668e8' : '#ffffff'}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Map pin dot */}
        <circle cx="24.5" cy="8.2" r="1.6" fill={isLight ? '#1668e8' : '#ffffff'} />
      </svg>

      <span
        className={`font-bold tracking-tight ${
          isLight ? 'text-white' : 'text-[#101828] dark:text-white'
        } ${textClass}`}
        style={{ fontFamily: "'Manrope', sans-serif" }}
      >
        NalarPublik
      </span>
    </div>
  )
}
