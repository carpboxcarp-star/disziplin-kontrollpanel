interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
}

export function Sparkline({ values, width = 240, height = 56 }: SparklineProps) {
  if (values.length < 2) {
    return <div className="text-xs text-ink-dim">Noch nicht genug Daten für einen Verlauf.</div>;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);

  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline points={points} fill="none" stroke="#e8a33d" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => {
        const x = i * step;
        const y = height - ((v - min) / range) * (height - 8) - 4;
        return <circle key={i} cx={x} cy={y} r={2.5} fill="#e8a33d" />;
      })}
    </svg>
  );
}
