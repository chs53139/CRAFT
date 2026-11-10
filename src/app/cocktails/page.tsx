import { redirect } from "next/navigation";
import CocktailsPageClient from "./CocktailsPageClient";

export default async function CocktailsPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : q?.[0]?.trim();
  if (query) redirect("/discover?q=" + encodeURIComponent(query));
  return <CocktailsPageClient />;
}
