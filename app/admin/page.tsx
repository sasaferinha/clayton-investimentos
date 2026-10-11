import type { Metadata } from "next";
import AdminPanel from "./AdminPanel";

export const metadata: Metadata = {
  title: "Painel administrativo | Clayton Investimentos",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main className="adminPage">
      <header className="adminHeader shell">
        <a className="brand" href="/" aria-label="Voltar ao site Clayton">
          <span className="brandMark">C</span>
          <span>CLAYTON<small>INVESTIMENTOS</small></span>
        </a>
        <a href="/">Ver site ↗</a>
      </header>

      <section className="adminShell">
        <p className="eyebrow">PAINEL ADMINISTRATIVO</p>
        <h1>Atualize o indicador<br/><em>sem mexer no código.</em></h1>
        <p className="adminIntro">A alteração aparece no site público assim que for salva.</p>
        <AdminPanel />
      </section>
    </main>
  );
}
