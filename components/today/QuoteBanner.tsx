import { quoteOfTheDay } from "@/lib/utils/quotes";

export function QuoteBanner({ date }: { date: string }) {
  return (
    <p className="text-center text-sm text-ink-dim italic px-4 py-1">
      „{quoteOfTheDay(date)}“
    </p>
  );
}
