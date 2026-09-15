export default function ChocoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3.5" y="2" width="9" height="12" rx="1.5" />
      <path d="M8 2v12M3.5 6h9M3.5 10h9" />
    </svg>
  );
}
