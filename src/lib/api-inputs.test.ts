import { describe, expect, it } from "vitest";
import { POST as invent } from "@/app/api/invent-drink/route";
import { POST as scan } from "@/app/api/scan-bottles/route";
import { POST as analytics } from "@/app/api/analytics/events/route";
import { canonicalIngredientId, suppliedIngredientIds } from "@/lib/ingredient-intelligence";
const req = (body: unknown) => new Request("http://localhost/api", { method: "POST", body: JSON.stringify(body) });
describe("public API input limits", () => {
  it("rejects malformed data instead of throwing", async () => {
    for (const [handler, body] of [[invent, null], [invent, { ingredientIds: [null, 42] }], [scan, { imageBase64: 42 }], [scan, { imageBase64: "invalid!" }], [analytics, { sessionId: "audit", events: "junk" }], [analytics, { sessionId: "audit", events: [null] }]] as const) {
      expect((await handler(req(body))).status).toBe(400);
    }
  });
  it("rejects oversized bodies without relying on a content-length header", async () => {
    expect((await invent(req({ ingredientIds: ["x".repeat(5000)] }))).status).toBe(413);
  });
  it("keeps valid recipe requests working and treats reserved keys as strings", async () => {
    expect((await invent(req({ ingredientIds: ["tequila-blanco", "lime-juice", "triple-sec"] }))).status).toBe(200);
    expect(canonicalIngredientId("constructor")).toBe("constructor");
    expect(suppliedIngredientIds(["constructor"])).toEqual(["constructor"]);
  });
});
