/*
 * DESIGN (v2): Missão Aratuba — tela Equipe.
 * Integrantes do grupo + carimbo de confirmação de presença. Persistência local.
 */
import { useState } from "react";
import { useLocalState } from "@/hooks/useLocalState";
import { Check, Plus, Trash2, UserCheck, UserX } from "lucide-react";

interface Integrante {
  id: string;
  nome: string;
  confirmado: boolean;
}

const INICIAIS = ["A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08"];

export default function Equipe() {
  const [equipe, setEquipe] = useLocalState<Integrante[]>("ar-equipe", []);
  const [nome, setNome] = useState("");

  const adicionar = () => {
    const n = nome.trim();
    if (!n) return;
    setEquipe((e) => [
      ...e,
      {
        id: `${Date.now()}`,
        nome: n,
        confirmado: false,
      },
    ]);
    setNome("");
  };

  const remover = (id: string) =>
    setEquipe((e) => e.filter((i) => i.id !== id));

  const confirmar = (id: string) =>
    setEquipe((e) =>
      e.map((i) => (i.id === id ? { ...i, confirmado: !i.confirmado } : i))
    );

  const confirmados = equipe.filter((e) => e.confirmado).length;

  return (
    <div className="space-y-4">
      <div className="brief-panel">
        <div className="panel-header">
          <span>Efetivo da missão</span>
          <span>{confirmados}/{equipe.length} confirmados</span>
        </div>
        <div className="p-4">
          <div className="flex gap-2">
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionar()}
              placeholder="Nome do integrante"
              className="h-12 flex-1 border border-border bg-background px-3 font-mono text-sm uppercase tracking-wide text-foreground placeholder:lowercase placeholder:tracking-normal placeholder:text-muted-foreground/60 focus:border-phosphor focus:outline-none"
            />
            <button
              onClick={adicionar}
              className="tac-btn w-12 bg-phosphor text-primary-foreground"
              aria-label="Adicionar integrante"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {equipe.length === 0 && (
            <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Nenhum efetivo registrado.<br />
              Adicione os nomes do grupo.
            </p>
          )}

          <div className="mt-4 space-y-2">
            {equipe.map((m, idx) => (
              <div
                key={m.id}
                className={`brief-panel flex items-center gap-3 p-3 ${
                  m.confirmado ? "border-l-phosphor" : ""
                }`}
              >
                <span className="stamp-box shrink-0">
                  {INICIAIS[idx % INICIAIS.length]}
                </span>
                <span className="flex-1 font-display text-base font-semibold uppercase tracking-wide">
                  {m.nome}
                </span>
                {m.confirmado && (
                  <span className="font-mono text-[9px] uppercase tracking-wider text-phosphor">
                    Confirmado
                  </span>
                )}
                <button
                  onClick={() => confirmar(m.id)}
                  aria-pressed={m.confirmado}
                  className={`tac-btn h-10 w-10 border ${
                    m.confirmado
                      ? "border-phosphor bg-phosphor/15 text-phosphor"
                      : "border-border bg-secondary/40 text-muted-foreground"
                  }`}
                  aria-label={m.confirmado ? "Desfazer confirmação" : "Confirmar presença"}
                >
                  {m.confirmado ? (
                    <UserCheck className="h-4 w-4" />
                  ) : (
                    <UserX className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => remover(m.id)}
                  className="tac-btn h-10 w-10 border border-border bg-secondary/40 text-muted-foreground"
                  aria-label="Remover integrante"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {equipe.length > 0 && (
        <div className="brief-panel amber">
          <div className="panel-header">
            <span className="text-amber-alert">Status do efetivo</span>
            <span className="font-display text-sm font-bold text-amber-alert">
              {Math.round((confirmados / equipe.length) * 100)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-secondary">
            <div
              className="h-full bg-phosphor transition-all"
              style={{ width: `${(confirmados / equipe.length) * 100}%` }}
            />
          </div>
          <p className="p-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {confirmados === equipe.length && equipe.length > 0
              ? "Efetivo completo · missão pronta"
              : `${equipe.length - confirmados} pendente(s) de confirmação`}
          </p>
        </div>
      )}
    </div>
  );
}
