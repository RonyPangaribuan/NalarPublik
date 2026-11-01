'use client'

// NalarPublik Logo — Opsi 3: Perspektif Publik (dari SVG resmi)
// Ikon: path NP monogram asli dari "Khusus Ikon Saja" & Full Logo SVG
const ICON_PATH =
  'M8 66L23 33C25 28.5 30.5 28.5 32.5 33L41 51L55 21C61 9.5 73.5 6 87 8C104 10.5 114 24.5 112 41.5C110 56.5 97 65.5 81 64.5L74 64C72.5 71 67.5 75.5 61 78V29L46 60C44 64.5 38.5 64.5 36.5 60L27.5 42L17 66H8ZM87 20C96.4 20 104 27.6 104 37C104 46.4 96.4 54 87 54C83 54 79.3 52.7 76.3 50.5L68.5 54.5L71.2 46C70.4 43.2 70 40.2 70 37C70 27.6 77.6 20 87 20Z'

export function Logo({
  size = 'md',
  variant = 'default',
}: {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'light'
}) {
  // Scale the icon height; viewBox is 120×88 so aspect ~1.36
  const iconH = size === 'sm' ? 24 : size === 'lg' ? 38 : 30
  const iconW = Math.round(iconH * (120 / 88))

  const textClass =
    size === 'sm'
      ? 'text-[15px]'
      : size === 'lg'
        ? 'text-[22px]'
        : 'text-[18px]'

  const isLight = variant === 'light'

  // Icon fill: dark-mode variant uses light blue (#9BC5DF), light uses brand blue (#3B66E4)
  const iconFill = isLight ? '#9BC5DF' : '#3B66E4'

  return (
    <div className="flex items-center gap-2 select-none">
      {/* Icon — scaled from the 120×88 viewBox SVG */}
      <svg
        aria-hidden="true"
        width={iconW}
        height={iconH}
        viewBox="0 0 120 88"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path fillRule="evenodd" d={ICON_PATH} fill={iconFill} />
      </svg>

      {/* Wordmark */}
      <span
        className={`font-extrabold tracking-tight leading-none ${
          isLight ? 'text-white' : 'text-[#0F172A] dark:text-white'
        } ${textClass}`}
        style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif", letterSpacing: '-0.03em' }}
      >
        Nalar<span className="font-normal">Publik</span>
      </span>
    </div>
  )
}
