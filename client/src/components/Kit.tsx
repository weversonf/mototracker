/*
 * DESIGN (v2): Missão Aratuba — tela Kit.
 * Checklist do que levar por categoria, persistência local, barra de progresso.
 */
import { useLocalState } from "@/hooks/useLocalState";
import { ITENS_CHECKLIST } from "@/lib/rota";
import { Check, Circle } from "lucide-react";

export default function Kit() {
  const [marcados, setMarcados] = useLocalState<string[]>("ar-kit", []);

  const toggle = (item: string) =>
    setMarcados((m) =>
      m.includes(item) ? m.filter((i) => i !== item) : [...m, item]
    );

  const total = ITENS_CHECKLIST.reduce((s, c) => s + c.itens.length, 0);
  const prontos = marcados.length;
  const pct = total > 0 ? Math.round((prontos / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="brief-panel amber">
        <div className="panel-header">
          <span className="text-amber-alert">Status do kit</span>
          <span className="font-display text-sm font-bold text-amber-alert">
            {pct}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-secondary">
          <div
            className="h-full bg-phosphor transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="p-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {prontos}/{total} itens no kit · mochila pronta
        </p>
      </div>

      {ITENS_CHECKLIST.map((cat) => (
        <div key={cat.categoria} className="brief-panel">
          <div className="panel-header">
            <span>{cat.categoria}</span>
            <span>
              {cat.itens.filter((i) => marcados.includes(i)).length}/
              {cat.itens.length}
            </span>
          </div>
          <div className="divide-y divide-border/50">
            {cat.itens.map((item) => {
              const done = marcados.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => toggle(item)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-secondary/50"
                  aria-pressed={done}
                >
                  {done ? (
                    <Check className="h-4 w-4 shrink-0 text-phosphor" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span
                    className={`text-sm ${
                      done
                        ? "text-muted-foreground line-through"
                        : "text-foreground/85"
                    }`}
                  >
                    {item}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground text-center pt-2">
        Progresso salvo no seu aparelho · nada é compartilhado
      </p>
    </div>
  );
}
