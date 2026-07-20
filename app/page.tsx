import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clayton | Assessor de Investimentos",
  description: "Estratégia personalizada para investir com segurança e construir patrimônio.",
};

const benefits = [
  ["01", "Estratégia sob medida", "Uma carteira desenhada para seus objetivos, prazo e perfil de risco."],
  ["02", "Decisões com clareza", "Acompanhamento próximo para você entender cada movimento do seu patrimônio."],
  ["03", "Visão de longo prazo", "Disciplina, diversificação e método para evoluir em todos os ciclos do mercado."],
];

export default function Home() {
  return (
    <main>
      <header className="nav shell">
        <a className="brand" href="#inicio" aria-label="Clayton - início">
          <span className="brandMark">C</span>
          <span>CLAYTON<small>INVESTIMENTOS</small></span>
        </a>
        <nav aria-label="Navegação principal">
          <a href="#sobre">Sobre</a><a href="#metodo">Método</a><a href="#contato">Contato</a>
        </nav>
        <a className="navCta" href="#contato">Fale comigo <span>↗</span></a>
      </header>

      <section className="hero" id="inicio">
        <div className="gridBackdrop" aria-hidden="true"><i/><i/><i/><i/><i/></div>
        <div className="orb" aria-hidden="true" />
        <div className="shell heroGrid">
          <div className="heroCopy">
            <p className="eyebrow"><span/> ASSESSORIA DE INVESTIMENTOS</p>
            <h1>Seu patrimônio merece <em>estratégia.</em></h1>
            <p className="lead">Eu te ajudo a investir com segurança, clareza e direção — para transformar objetivos em um plano que realmente trabalha por você.</p>
            <div className="heroActions">
              <a className="primary" href="#contato">Quero investir melhor <span>↗</span></a>
              <a className="textLink" href="#metodo"><span className="play">▶</span> Conheça meu método</a>
            </div>
            <div className="proof">
              <div><strong>+11M</strong><span>sob gestão</span></div>
              <div><strong>100%</strong><span>foco no cliente</span></div>
              <div><strong>1:1</strong><span>atendimento próximo</span></div>
            </div>
          </div>

          <div className="portraitWrap">
            <div className="marketCard marketCardTop"><span>IBOV</span><strong>▲ 1,42%</strong><small>Mercado em alta</small></div>
            <img className="portrait" src="/images/clayton.png" alt="Clayton, assessor de investimentos" />
            <div className="nameCard"><small>ASSESSOR DE INVESTIMENTOS</small><strong>Clayton</strong><span>Estratégia • Segurança • Resultado</span></div>
            <div className="marketCard marketCardBottom"><span>ESTRATÉGIA</span><strong>PERSONALIZADA</strong><small>para o seu perfil</small></div>
          </div>
        </div>
        <div className="ticker" aria-label="Áreas de atuação"><div>RENDA FIXA <b>◆</b> FUNDOS DE INVESTIMENTO <b>◆</b> RENDA VARIÁVEL <b>◆</b> PREVIDÊNCIA <b>◆</b> PROTEÇÃO PATRIMONIAL <b>◆</b></div></div>
      </section>

      <section className="about shell" id="sobre">
        <div><p className="eyebrow"><span/> SOBRE A ASSESSORIA</p><h2>Investir bem não é sorte.<br/>É ter <em>direção.</em></h2></div>
        <div className="aboutText"><p>Mais do que indicar produtos, meu trabalho é entender sua vida financeira e construir uma estratégia coerente com onde você está e onde quer chegar.</p><p>Sem promessas fáceis. Sem linguagem complicada. Com método, transparência e acompanhamento de verdade.</p><a href="#contato">Vamos conversar <span>↗</span></a></div>
      </section>

      <section className="method" id="metodo">
        <div className="shell">
          <p className="eyebrow"><span/> COMO POSSO AJUDAR</p>
          <div className="sectionHead"><h2>Patrimônio se constrói<br/>com <em>boas decisões.</em></h2><p>Um processo simples, estratégico e sempre alinhado ao que faz sentido para você.</p></div>
          <div className="cards">{benefits.map(([n,t,d]) => <article key={n}><span className="cardNo">{n}</span><div className="icon">↗</div><h3>{t}</h3><p>{d}</p></article>)}</div>
        </div>
      </section>

      <section className="cta" id="contato">
        <div className="shell ctaInner"><div><p className="eyebrow"><span/> PRÓXIMO PASSO</p><h2>Seu futuro financeiro<br/>começa com uma <em>conversa.</em></h2></div><div><p>Conte seus objetivos e descubra como uma estratégia personalizada pode fazer seu patrimônio avançar.</p><a className="primary" href="https://wa.me/5500000000000" target="_blank" rel="noreferrer">Agendar conversa <span>↗</span></a></div></div>
      </section>

      <footer className="shell"><div className="brand"><span className="brandMark">C</span><span>CLAYTON<small>INVESTIMENTOS</small></span></div><p>Investimentos envolvem riscos. Rentabilidade passada não representa garantia de rentabilidade futura.</p><span>© 2026 Clayton</span></footer>
    </main>
  );
}
