import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Estratégias de Investimento | Clayton",
  description: "Conheça as estratégias usadas por Clayton para construir uma carteira alinhada aos seus objetivos.",
};

const whatsappUrl = "https://wa.me/553599069477?text=Vim%20pelo%20site%20e%20quero%20investir%20melhor";

const strategies = [
  ["01", "Reserva e liquidez", "Organização da base financeira com segurança e acesso ao dinheiro quando você precisar."],
  ["02", "Renda fixa", "Seleção de ativos de acordo com prazo, objetivo, proteção e oportunidades de mercado."],
  ["03", "Fundos de investimento", "Diversificação com gestão profissional e escolhas coerentes com o seu perfil."],
  ["04", "Renda variável", "Exposição planejada ao crescimento, respeitando limites de risco e visão de longo prazo."],
  ["05", "Previdência", "Estratégias para aposentadoria, sucessão e eficiência tributária ao longo dos anos."],
  ["06", "Proteção patrimonial", "Decisões integradas para preservar o patrimônio e dar tranquilidade à sua família."],
];

export default function EstrategiasPage() {
  return (
    <main className="innerPage">
      <header className="innerNav shell">
        <a className="brand" href="/"><span className="brandMark">C</span><span>CLAYTON<small>INVESTIMENTOS</small></span></a>
        <nav aria-label="Navegação"><a href="/">Início</a><a href="/perfil-investidor">Seu perfil</a></nav>
        <a className="navCta" href={whatsappUrl} target="_blank" rel="noreferrer">Fale comigo <span>↗</span></a>
      </header>

      <section className="innerHero">
        <div className="shell innerHeroContent">
          <p className="eyebrow">ESTRATÉGIAS DE INVESTIMENTO</p>
          <h1>Uma carteira com propósito,<br/><em>não um conjunto de produtos.</em></h1>
          <p>Cada decisão começa pelos seus objetivos, pelo prazo e pelo nível de risco que faz sentido para você.</p>
          <a className="primary" href={whatsappUrl} target="_blank" rel="noreferrer">Montar minha estratégia <span>↗</span></a>
        </div>
      </section>

      <section className="innerSection shell">
        <div className="innerSectionHead"><p className="eyebrow">COMO POSSO AJUDAR</p><h2>Estratégias para cada fase<br/>da sua <em>jornada financeira.</em></h2></div>
        <div className="strategyGrid">{strategies.map(([n,t,d]) => <article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div>
      </section>

      <section className="innerCta"><div className="shell"><div><p className="eyebrow">PRÓXIMO PASSO</p><h2>Vamos transformar seus objetivos em um plano.</h2></div><a className="primary" href={whatsappUrl} target="_blank" rel="noreferrer">Conversar com Clayton <span>↗</span></a></div></section>
    </main>
  );
}
