import type { ReactNode } from "react";
import { DashboardProvider } from "@/lib/context/DashboardContext";
import { StandbyProvider } from "@/lib/context/StandbyContext";
import { StandbyOverlay } from "@/components/standby/StandbyOverlay";
import { Header } from "@/components/layout/Header";
import { TabNav } from "@/components/layout/TabNav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardProvider>
      <StandbyProvider>
        <div className="flex min-h-full flex-col">
          <div className="sticky top-0 z-30 bg-bg">
            <Header />
            <TabNav />
          </div>
          <main className="flex-1 p-4 pb-10 max-w-3xl w-full mx-auto">{children}</main>
        </div>
        <StandbyOverlay />
      </StandbyProvider>
    </DashboardProvider>
  );
}
