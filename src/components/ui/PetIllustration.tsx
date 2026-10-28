/** Friendly dog illustration in brand colours, after the booking reference design. */
export function PetIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 240" className={className} role="img" aria-label="Illustration of a happy dog">
      <rect width="320" height="240" fill="var(--color-brand-soft)" />
      <circle cx="48" cy="60" r="10" fill="none" stroke="#fff" strokeWidth="3" />
      <circle cx="268" cy="96" r="14" fill="none" stroke="#fff" strokeWidth="3" />
      <circle cx="40" cy="150" r="6" fill="#fff" />
      <circle cx="282" cy="40" r="5" fill="#fff" />
      <path d="M262 150l4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill="var(--color-sun)" />
      <path d="M62 100l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="var(--color-brand)" opacity=".6" />
      {/* body */}
      <path d="M90 240c0-48 32-74 70-74s70 26 70 74z" fill="#E7A86A" />
      {/* bandana */}
      <path d="M110 180h100l-50 46z" fill="var(--color-brand)" />
      <path d="M160 194c-4-6-14-3-11 4l11 10 11-10c3-7-7-10-11-4z" fill="#fff" opacity=".9" />
      {/* ears */}
      <path d="M96 78c-22 6-28 52-12 70 10 10 24-4 26-22z" fill="#B97842" />
      <path d="M224 78c22 6 28 52 12 70-10 10-24-4-26-22z" fill="#B97842" />
      {/* head */}
      <ellipse cx="160" cy="112" rx="64" ry="62" fill="#EDB57A" />
      <ellipse cx="160" cy="142" rx="36" ry="26" fill="#FBE3C8" />
      {/* eyes */}
      <circle cx="134" cy="106" r="11" fill="#2B1E26" />
      <circle cx="186" cy="106" r="11" fill="#2B1E26" />
      <circle cx="138" cy="102" r="4" fill="#fff" />
      <circle cx="190" cy="102" r="4" fill="#fff" />
      {/* cheeks */}
      <ellipse cx="116" cy="130" rx="9" ry="6" fill="var(--color-brand)" opacity=".25" />
      <ellipse cx="204" cy="130" rx="9" ry="6" fill="var(--color-brand)" opacity=".25" />
      {/* nose + mouth */}
      <ellipse cx="160" cy="130" rx="11" ry="8" fill="#2B1E26" />
      <path d="M160 138v6m0 0c-5 8-14 8-16 2m16-2c5 8 14 8 16 2" stroke="#2B1E26" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M152 152c2 10 14 10 16 0z" fill="#E86F8F" />
    </svg>
  );
}
