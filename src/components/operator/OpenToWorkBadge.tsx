// LinkedIn-style "#OPENTOWORK" curved ring overlay for AAO avatars.
// Designed to sit inside a `rounded-full overflow-hidden` parent.
interface Props {
  className?: string;
  /** Override label (defaults to #OPENTOWORK). */
  label?: string;
}

export default function OpenToWorkBadge({ className = "", label = "#OPENTOWORK" }: Props) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Arc from upper-left through bottom to right-middle (matches reference). */}
        <path id="otw-arc" d="M 17.3 69.9 A 88 88 0 0 1 188 100" fill="none" />
      </defs>
      <use href="#otw-arc" stroke="hsl(142 55% 28%)" strokeWidth="22" strokeLinecap="round" />
      <text fill="#ffffff" fontSize="15" fontWeight="800" letterSpacing="3" fontFamily="ui-sans-serif, system-ui, sans-serif">
        <textPath href="#otw-arc" startOffset="50%" textAnchor="middle">{label}</textPath>
      </text>
    </svg>
  );
}
