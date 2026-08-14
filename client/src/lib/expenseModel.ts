export type ExpenseCategory = "Combustível" | "Manutenção" | "Lavagem";

export type ExpenseDraft = {
  category: ExpenseCategory;
  description: string;
  amount: string;
};

export type ValidExpenseDraft = {
  category: ExpenseCategory;
  description: string;
  amount: number;
  formattedAmount: string;
};

function normalizeAmount(value: string) {
  const compact = value.trim().replace(/\s/g, "").replace(/^R\$?/i, "");

  if (!compact) return Number.NaN;

  const normalized = compact.includes(",")
    ? compact.replace(/\./g, "").replace(",", ".")
    : compact;

  return Number(normalized);
}

export function formatExpenseAmount(amount: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
}

export function validateExpenseDraft(draft: ExpenseDraft): ValidExpenseDraft {
  const description = draft.description.trim();
  const amount = normalizeAmount(draft.amount);

  if (description.length < 2) {
    throw new Error("Informe o que foi pago para registrar o gasto.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Informe um valor maior que zero.");
  }

  return {
    category: draft.category,
    description,
    amount,
    formattedAmount: formatExpenseAmount(amount),
  };
}
