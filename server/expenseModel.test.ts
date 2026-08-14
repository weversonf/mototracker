import { describe, expect, it } from "vitest";
import { validateExpenseDraft } from "../client/src/lib/expenseModel";

describe("validateExpenseDraft", () => {
  it("aceita descrição e valor brasileiro para um novo gasto", () => {
    expect(validateExpenseDraft({ category: "Manutenção", description: "Troca de pastilhas", amount: "R$ 185,90" })).toEqual({
      category: "Manutenção",
      description: "Troca de pastilhas",
      amount: 185.9,
      formattedAmount: "R$ 185,90",
    });
  });

  it("rejeita um registro sem descrição", () => {
    expect(() => validateExpenseDraft({ category: "Lavagem", description: " ", amount: "45" })).toThrow("Informe o que foi pago");
  });

  it("rejeita valor vazio, inválido ou igual a zero", () => {
    expect(() => validateExpenseDraft({ category: "Combustível", description: "Posto", amount: "" })).toThrow("Informe um valor maior que zero");
    expect(() => validateExpenseDraft({ category: "Combustível", description: "Posto", amount: "0" })).toThrow("Informe um valor maior que zero");
  });
});
