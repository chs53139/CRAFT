"use client";

import { AnalyticsBootstrap } from "@/components/AnalyticsBootstrap";
import { UserDataProvider } from "@/components/UserDataProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserDataProvider>
      <AnalyticsBootstrap />
      {children}
    </UserDataProvider>
  );
}
