// Суппорт, который стоит на месте, пока диск вращается под ним
const P = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return `${(200 + r * Math.cos(a)).toFixed(1)} ${(200 + r * Math.sin(a)).toFixed(1)}`;
};

export default function Caliper() {
  const body = `M ${P(208, -40)} A 208 208 0 0 1 ${P(208, 40)} L ${P(108, 40)} A 108 108 0 0 0 ${P(108, -40)} Z`;
  const shine = `M ${P(200, -34)} A 200 200 0 0 1 ${P(200, 34)}`;

  return (
    <svg viewBox="0 0 400 400" className="pointer-events-none h-full w-full overflow-visible">
      <path d={body} className="fill-accent stroke-black/40" strokeWidth="3" strokeLinejoin="round" />
      <path d={shine} fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" />
      <circle cx={P(190, -24).split(" ")[0]} cy={P(190, -24).split(" ")[1]} r="7" fill="#0b0b0d" opacity=".75" />
      <circle cx={P(190, 24).split(" ")[0]} cy={P(190, 24).split(" ")[1]} r="7" fill="#0b0b0d" opacity=".75" />
      <text
        transform="translate(352 200) rotate(90)"
        textAnchor="middle"
        className="fill-on-accent"
        fontSize="15"
        fontWeight="800"
        letterSpacing="5"
      >
        DRIVEPARTS
      </text>
    </svg>
  );
}
