"use client";

import { UserDataProvider } from "@/components/UserDataProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <UserDataProvider>{children}</UserDataProvider>;
}
