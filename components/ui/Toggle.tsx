interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
  sublabel?: string;
}

export function Toggle({ checked, onChange, disabled, label, sublabel }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center justify-between gap-4 rounded-md border px-5 py-4 min-h-[64px] text-left transition ${
        checked
          ? "border-amber bg-amber/10"
          : "border-border bg-panel-raised active:bg-panel"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <span className="flex flex-col">
        <span className={`text-base font-medium ${checked ? "text-amber" : "text-ink"}`}>
          {label}
        </span>
        {sublabel && <span className="text-xs text-ink-dim mt-0.5">{sublabel}</span>}
      </span>
      <span
        className={`relative shrink-0 w-14 h-8 rounded-full border transition-colors ${
          checked ? "bg-amber border-amber" : "bg-panel border-border"
        }`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-bg transition-transform ${
            checked ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}
