import { redirect } from "next/navigation";

export default function FindByIngredientPage() {
  redirect("/discover?filters=ingredients");
}
