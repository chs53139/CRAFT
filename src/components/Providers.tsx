"use client";

import { AnalyticsBootstrap } from "@/components/AnalyticsBootstrap";
import { EngagementTracker } from "@/components/EngagementTracker";
import { InstallCraftPromptHost } from "@/components/InstallCraftPrompt";
import { MadeHistoryProvider } from "@/components/MadeHistoryProvider";
import { ShoppingListProvider } from "@/components/ShoppingListProvider";
import { UserDataProvider } from "@/components/UserDataProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserDataProvider>
      <ShoppingListProvider>
        <MadeHistoryProvider>
          <AnalyticsBootstrap />
          <EngagementTracker />
          <InstallCraftPromptHost />
          {children}
        </MadeHistoryProvider>
      </ShoppingListProvider>
    </UserDataProvider>
  );
}
