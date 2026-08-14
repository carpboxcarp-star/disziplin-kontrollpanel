import { Panel } from "@/components/ui/Panel";
import { SPLIT_LABELS } from "@/lib/utils/split";
import type { SplitDay } from "@/lib/types";

export function SplitDayCard({ splitDay }: { splitDay: SplitDay }) {
  return (
    <Panel raised>
      <p className="text-xs uppercase tracking-wider text-ink-dim mb-1">Heute dran</p>
      <p className="font-display text-4xl text-amber">{SPLIT_LABELS[splitDay]}</p>
    </Panel>
  );
}
