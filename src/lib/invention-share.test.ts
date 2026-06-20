import { describe, expect, it } from "vitest";
import {
  decodeInventionToken,
  encodeInventionToken,
  inventionToSharePayload,
  sharedPayloadToInvention,
} from "@/lib/invention-share";
import { MixologistInvention } from "@/lib/mixologist/types";

const sample: MixologistInvention = {
  source: "original",
  confidence: 88,
  name: "Smoky Citrus Flip",
  tagline: "Bright upfront, smoky finish.",
  ingredients: [
    { ingredientId: "bourbon", name: "Bourbon", amount: "2 oz" },
    { ingredientId: "lime-juice", name: "Lime juice", amount: "0.75 oz" },
  ],
  instructions: ["Shake hard with ice.", "Strain into a chilled coupe."],
  flavorProfile: ["citrus", "spirit-forward"],
  sweetness: "balanced",
  strength: "medium",
  method: "Shake",
  glassware: "Coupe",
  aiPowered: true,
};

describe("invention-share", () => {
  it("round-trips invention payloads through a share token", () => {
    const token = encodeInventionToken(sample);
    const decoded = decodeInventionToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded!.name).toBe(sample.name);
    expect(decoded!.ingredients).toHaveLength(2);
  });

  it("supports unicode names in share tokens", () => {
    const unicode = { ...sample, name: "Piña Solstice" };
    const token = encodeInventionToken(unicode);
    expect(decodeInventionToken(token)?.name).toBe("Piña Solstice");
  });

  it("converts shared payloads back into mixologist inventions", () => {
    const payload = inventionToSharePayload(sample);
    const restored = sharedPayloadToInvention(payload);
    expect(restored.name).toBe(sample.name);
    expect(restored.ingredients[0]?.name).toBe("Bourbon");
  });
});
