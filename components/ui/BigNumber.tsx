interface BigNumberProps {
  value: string | number;
  label?: string;
  color?: "amber" | "ink";
  size?: "lg" | "xl" | "md";
}

const SIZES: Record<NonNullable<BigNumberProps["size"]>, string> = {
  md: "text-3xl",
  lg: "text-5xl",
  xl: "text-7xl",
};

export function BigNumber({ value, label, color = "amber", size = "lg" }: BigNumberProps) {
  return (
    <div className="flex flex-col items-start">
      <span
        className={`font-display leading-none ${SIZES[size]} ${
          color === "amber" ? "text-amber" : "text-ink"
        }`}
      >
        {value}
      </span>
      {label && (
        <span className="text-xs uppercase tracking-wider text-ink-dim mt-1">{label}</span>
      )}
    </div>
  );
}
