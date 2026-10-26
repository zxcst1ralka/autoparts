// Тормозной диск, нарисованный кодом. На заставке он медленно вращается.
export default function BrakeDisc() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full">
      <defs>
        <radialGradient id="disc" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#3a3d44" />
          <stop offset="0.6" stopColor="#25272c" />
          <stop offset="1" stopColor="#141518" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="190" fill="url(#disc)" stroke="#6b6f78" strokeWidth="2" />
      <circle cx="200" cy="200" r="150" fill="none" stroke="#3b3e45" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="110" fill="none" stroke="#3b3e45" strokeWidth="1.5" />
      {Array.from({ length: 36 }).map((_, i) => (
        <rect key={i} x="197" y="30" width="6" height="26" rx="3" className="fill-bg" transform={`rotate(${i * 10} 200 200)`} />
      ))}
      {Array.from({ length: 18 }).map((_, i) => (
        <circle key={`h${i}`} cx="200" cy="84" r="5" className="fill-bg" transform={`rotate(${i * 20 + 10} 200 200)`} />
      ))}
      <circle cx="200" cy="200" r="62" fill="#1a1b1f" stroke="#555962" strokeWidth="3" />
      {Array.from({ length: 5 }).map((_, i) => (
        <circle key={`b${i}`} cx="200" cy="158" r="9" className="fill-bg stroke-accent" strokeWidth="2" transform={`rotate(${i * 72} 200 200)`} />
      ))}
      <circle cx="200" cy="200" r="22" className="fill-bg stroke-accent" strokeWidth="2" />
    </svg>
  );
}
