import { redirect } from "next/navigation";

export default function MocktailsPage() {
  redirect("/discover?type=mocktails");
}
