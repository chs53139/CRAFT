import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 sm:px-6">
      <EmptyState
        title="Wrong glass, wrong page"
        description="This cocktail doesn't exist — or the link took a wrong turn at the bitters."
        actionLabel="Back to home"
        actionHref="/"
        icon="🍸"
      />
      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        Or try{" "}
        <Link href="/cocktails" className="text-[var(--accent)] hover:underline">
          Tonight&apos;s menu
        </Link>
      </p>
    </div>
  );
}
