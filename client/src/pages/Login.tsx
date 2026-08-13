/* MotoPulse — login screen: a calm, editorial gate for the private riding journal. Google is the only entry action. */

import { Chrome, LockKeyhole, LoaderCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";

const ROAD_IMAGE = "/manus-storage/motopulse-road_f259f809.jpg";

type LoginProps = {
  configured: boolean;
  authError: string | null;
  onSignIn: () => Promise<void>;
};

export default function Login({ configured, authError, onSignIn }: LoginProps) {
  const [busy, setBusy] = useState(false);

  async function handleSignIn() {
    setBusy(true);
    try {
      await onSignIn();
    } catch {
      // The context exposes a human-readable error without interrupting the screen.
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <div className="auth-screen__image" style={{ backgroundImage: `url(${ROAD_IMAGE})` }} aria-hidden="true" />
      <div className="auth-screen__wash" aria-hidden="true" />
      <section className="auth-card" aria-labelledby="login-title">
        <div className="auth-card__topline"><span className="status-dot status-dot--live" /> DIÁRIO DE ESTRADA · ACESSO PRIVADO</div>
        <div className="auth-card__brand"><span className="brand-mark" aria-hidden="true"><span className="brand-mark__inner" /></span><span className="brand-name">Moto<span>Pulse</span></span></div>
        <div className="auth-card__copy">
          <p className="eyebrow">PLANEJE · REGISTRE · CUIDE</p>
          <h1 id="login-title">Sua moto.<br /><em>Suas histórias.</em></h1>
          <p>Organize viagens, acompanhe gastos e mantenha o histórico da moto em um só lugar.</p>
        </div>
        <button className="google-button" type="button" disabled={busy || !configured} onClick={handleSignIn}>
          {busy ? <LoaderCircle size={18} className="spin" /> : <Chrome size={18} />}
          <span>{busy ? "Abrindo acesso..." : "Entrar com Google"}</span>
        </button>
        {!configured && <p className="auth-message" role="status">Configure as variáveis `VITE_FIREBASE_*` na Vercel para habilitar o acesso.</p>}
        {authError && <p className="auth-message auth-message--error" role="alert">{authError}</p>}
        <div className="auth-card__foot"><span><ShieldCheck size={14} /> Seus registros ficam vinculados à sua conta</span><span><LockKeyhole size={13} /> Acesso seguro</span></div>
      </section>
    </main>
  );
}

