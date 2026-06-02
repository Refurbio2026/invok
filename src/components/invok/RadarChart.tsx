type Point = { label: string; value: number; max?: number };

export function RadarChart({
  data,
  compare,
  size = 320,
}: {
  data: Point[];
  compare?: Point[]; // optional second series (e.g. vstup vs výstup)
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 36;
  const n = data.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const point = (i: number, v: number, max: number) => {
    const ratio = Math.max(0, Math.min(1, v / max));
    return [cx + Math.cos(angle(i)) * r * ratio, cy + Math.sin(angle(i)) * r * ratio] as const;
  };

  const polygon = (series: Point[]) =>
    series.map((p, i) => point(i, p.value, p.max ?? 40).join(",")).join(" ");

  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto">
      {rings.map((k) => (
        <polygon
          key={k}
          points={data
            .map((_, i) => {
              const x = cx + Math.cos(angle(i)) * r * k;
              const y = cy + Math.sin(angle(i)) * r * k;
              return `${x},${y}`;
            })
            .join(" ")}
          fill="none"
          stroke="oklch(0.92 0.012 250)"
          strokeWidth="1"
        />
      ))}
      {data.map((_, i) => {
        const [x, y] = point(i, 1, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="oklch(0.92 0.012 250)" strokeWidth="1" />;
      })}

      {compare && (
        <polygon
          points={polygon(compare)}
          fill="oklch(0.68 0.12 190 / 0.18)"
          stroke="oklch(0.68 0.12 190)"
          strokeWidth="1.5"
        />
      )}
      <polygon
        points={polygon(data)}
        fill="oklch(0.42 0.16 258 / 0.28)"
        stroke="oklch(0.42 0.16 258)"
        strokeWidth="2"
      />

      {data.map((p, i) => {
        const [lx, ly] = [cx + Math.cos(angle(i)) * (r + 22), cy + Math.sin(angle(i)) * (r + 22)];
        return (
          <text
            key={p.label}
            x={lx}
            y={ly}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground"
            style={{ fontSize: 10, fontWeight: 600 }}
          >
            {p.label}
          </text>
        );
      })}
    </svg>
  );
}
