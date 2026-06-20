import type { Metadata } from "next";
import { CocktailDetailClient } from "@/app/cocktails/[id]/CocktailDetailClient";
import { getCocktailById } from "@/lib/cocktail-matching";
import { buildCocktailShareMetadata } from "@/lib/share-metadata";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const cocktail = getCocktailById(id);

  if (!cocktail) {
    return {
      title: "Cocktail not found",
    };
  }

  return buildCocktailShareMetadata(cocktail);
}

export default function CocktailDetailPage() {
  return <CocktailDetailClient />;
}
