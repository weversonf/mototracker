import { describe, expect, it } from "vitest";
import { getProfileIdentity } from "@/lib/profileIdentity";

describe("getProfileIdentity", () => {
  it("usa os dados da conta Google autenticada", () => {
    expect(getProfileIdentity({ displayName: "  Weverson Freire ", email: " weverson@example.com " })).toEqual({
      displayName: "Weverson Freire",
      email: "weverson@example.com",
      initials: "WF",
    });
  });

  it("mantém fallbacks neutros se a conta não expõe nome ou e-mail", () => {
    expect(getProfileIdentity(null)).toEqual({
      displayName: "Piloto",
      email: "Conta Google conectada",
      initials: "P",
    });
  });
});
