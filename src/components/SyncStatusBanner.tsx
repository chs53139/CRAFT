"use client";

import { ErrorBanner } from "@/components/ErrorBanner";
import { useUserData } from "@/components/UserDataProvider";

export function SyncStatusBanner() {
  const { error, syncing, clearError } = useUserData();

  if (!error && !syncing) return null;

  return (
    <div className="px-4 pt-2">
      {error ? (
        <ErrorBanner message={error} onDismiss={clearError} />
      ) : (
        <p className="text-center text-xs text-[var(--muted)]" role="status">
          Syncing your bar…
        </p>
      )}
    </div>
  );
}
