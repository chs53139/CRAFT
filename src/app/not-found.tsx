import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";

export default function NotFound() {
  return (
    <div className="app-screen flex min-h-[70dvh] flex-col justify-center">
      <EmptyState
        title="Wrong glass, wrong page"
        description="This cocktail doesn't exist — or the link took a wrong turn at the bitters."
        actionLabel="Back to Home"
        actionHref="/"
        icon="🍸"
      />
      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Or try{" "}
        <Link href="/cocktails" className="font-semibold text-[var(--accent)]">
          Tonight
        </Link>
      </p>
    </div>
  );
}
