"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchField } from "@/components/SearchField";

export function HomeSearchEntry() {
  const router = useRouter();
  const [draft, setDraft] = useState("");

  function navigate(query: string) {
    const trimmed = query.trim();
    const href = trimmed
      ? `/cocktails?view=browse&q=${encodeURIComponent(trimmed)}`
      : "/cocktails?view=browse";
    router.push(href);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    navigate(draft);
  }

  return (
    <form className="home-search-entry app-section" onSubmit={onSubmit}>
      <SearchField
        value={draft}
        onChange={setDraft}
        placeholder="Search cocktails, spirits, ingredients…"
        ariaLabel="Search cocktails, spirits, and ingredients"
      />
    </form>
  );
}
