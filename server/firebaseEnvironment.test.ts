import { describe, expect, it } from "vitest";

describe("configuração pública do Firebase", () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  (apiKey ? it : it.skip)("expõe a configuração e rejeita chaves Firebase inválidas antes do login", async () => {
    expect(apiKey).toBeTruthy();
    expect(projectId).toBe("drivo-e-money");

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/projects?key=${encodeURIComponent(apiKey)}`,
      { signal: AbortSignal.timeout(8_000) },
    );
    const payload = await response.text();

    expect(payload).not.toMatch(/API key not valid|invalid API key/i);
    expect(response.status).not.toBe(400);
  });
});
