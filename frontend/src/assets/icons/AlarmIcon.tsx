interface AlarmIconProps {
  size?: number
}

export const AlarmIcon = ({ size = 56 }: AlarmIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Bell body */}
    <circle cx="28" cy="30" r="18" fill="#FFF0F0" stroke="#FF6B6B" strokeWidth="2.5" />
    {/* Clock face */}
    <circle cx="28" cy="30" r="13" fill="white" />
    {/* Hour hand */}
    <line x1="28" y1="30" x2="28" y2="21" stroke="#333" strokeWidth="2.2" strokeLinecap="round" />
    {/* Minute hand */}
    <line x1="28" y1="30" x2="34" y2="30" stroke="#333" strokeWidth="2.2" strokeLinecap="round" />
    {/* Center dot */}
    <circle cx="28" cy="30" r="1.5" fill="#333" />
    {/* Left bell foot */}
    <path
      d="M14 45 Q11 42 14 40"
      stroke="#FF6B6B"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Right bell foot */}
    <path
      d="M42 45 Q45 42 42 40"
      stroke="#FF6B6B"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Left bell */}
    <circle cx="11" cy="12" r="5" fill="#FFD93D" stroke="#FFC107" strokeWidth="1.5" />
    {/* Right bell */}
    <circle cx="45" cy="12" r="5" fill="#FFD93D" stroke="#FFC107" strokeWidth="1.5" />
    {/* Left arm */}
    <line x1="15" y1="20" x2="19" y2="23" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" />
    {/* Right arm */}
    <line x1="41" y1="20" x2="37" y2="23" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" />
    {/* Bottom feet */}
    <ellipse cx="22" cy="49" rx="3" ry="2" fill="#FF6B6B" opacity="0.6" />
    <ellipse cx="34" cy="49" rx="3" ry="2" fill="#FF6B6B" opacity="0.6" />
  </svg>
)
