import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil do Investidor | Clayton",
  description: "Entenda como objetivos, prazo e tolerância ao risco orientam uma estratégia de investimentos personalizada.",
};

const whatsappUrl = "https://wa.me/553599069477?text=Vim%20pelo%20site%20e%20quero%20investir%20melhor";

const profiles = [
  ["Conservador", "Prioriza estabilidade, liquidez e preservação do patrimônio, aceitando retornos mais previsíveis."],
  ["Moderado", "Busca equilíbrio entre segurança e crescimento, diversificando sem assumir riscos excessivos."],
  ["Arrojado", "Aceita maior oscilação em busca de crescimento no longo prazo, sempre com estratégia e diversificação."],
];

export default function PerfilInvestidorPage() {
  return (
    <main className="innerPage">
      <header className="innerNav shell">
        <a className="brand" href="/"><span className="brandMark">C</span><span>CLAYTON<small>INVESTIMENTOS</small></span></a>
        <nav aria-label="Navegação"><a href="/">Início</a><a href="/estrategias">Estratégias</a></nav>
        <a className="navCta" href={whatsappUrl} target="_blank" rel="noreferrer">Fale comigo <span>↗</span></a>
      </header>

      <section className="innerHero profileHero">
        <div className="shell innerHeroContent">
          <p className="eyebrow">PERFIL DO INVESTIDOR</p>
          <h1>Seu dinheiro precisa seguir<br/><em>o seu momento de vida.</em></h1>
          <p>Antes de escolher investimentos, é essencial entender seus objetivos, prazo, experiência e conforto com as oscilações do mercado.</p>
          <a className="primary" href={whatsappUrl} target="_blank" rel="noreferrer">Descobrir meu perfil <span>↗</span></a>
        </div>
      </section>

      <section className="innerSection shell">
        <div className="innerSectionHead"><p className="eyebrow">TRÊS PONTOS DE PARTIDA</p><h2>Não existe perfil melhor.<br/>Existe o que combina <em>com você.</em></h2></div>
        <div className="profileGrid">{profiles.map(([t,d], index) => <article key={t}><span>0{index + 1}</span><div className="profileMeter"><i style={{width: `${34 + index * 30}%`}}/></div><h3>{t}</h3><p>{d}</p></article>)}</div>
        <div className="profileNote"><strong>Importante:</strong><p>O perfil é apenas o começo. Uma boa estratégia também considera seus projetos, reserva, renda, patrimônio e horizonte de investimento.</p></div>
      </section>

      <section className="innerCta"><div className="shell"><div><p className="eyebrow">ANÁLISE PERSONALIZADA</p><h2>Descubra uma estratégia adequada à sua realidade.</h2></div><a className="primary" href={whatsappUrl} target="_blank" rel="noreferrer">Falar com Clayton <span>↗</span></a></div></section>
    </main>
  );
}
