import { ArrowDown, ArrowRight, ArrowUpRight, GithubLogo, LinkedinLogo, Play, Plus } from "@phosphor-icons/react/dist/ssr";
import { Experience, PortraitStage, SoundEntry, MagneticLink, MobileMenu, ScrollCue } from "./experience";
import { operatingModel, timeline } from "./content";
import { CreativeExperiment } from "./creative-experiment";
import { TransformationJourney, ProductJourney } from "./cinematic-journey";

const episodes = [
  { number: "03", title: "Borrowed Eyes", subject: "Cooperative perception concept. Responsible product investment.", url: "https://www.linkedin.com/feed/update/urn:li:ugcPost:7515157678277451776" },
  { number: "02", title: "The $0 Governance Gap", subject: "The business exposure behind AI vendor concentration.", url: "https://lnkd.in/p/gE-KvPMH" },
  { number: "01", title: "Target’s Q2 Momentum", subject: "The decisions behind market performance.", url: "https://lnkd.in/p/gJnXQcag" },
];

export default function Home() {
  return <Experience>
    <a className="skip-link" href="#about">Skip to career journey</a>
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="Dhiraj Raikantiwar, home">Dhiraj Raikantiwar<span className="wordmark-dot" /></a>
      <nav className="profile-links" aria-label="Professional links">
        <a href="https://www.linkedin.com/in/dhiraj-raikantiwar-20501715/" target="_blank" rel="noreferrer"><LinkedinLogo aria-hidden="true" />LinkedIn<ArrowUpRight aria-hidden="true" /></a>
        <a href="https://github.com/dhirajraikantiwar" target="_blank" rel="noreferrer"><GithubLogo aria-hidden="true" />GitHub<ArrowUpRight aria-hidden="true" /></a>
        <a href="/Dhiraj_Raikantiwar_Executive_Resume.pdf" download>Download résumé<ArrowDown aria-hidden="true" /></a>
      </nav>
      <MobileMenu />
    </header>
    <main>
      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-sticky">
          <PortraitStage />
          <div className="hero-content">
            <h1 id="hero-title">From signal<br /><span>to scale.</span></h1>
            <p className="hero-role">Data &amp; AI transformation leader</p>
            <nav className="hero-destinations" aria-label="Explore my portfolio">
              <MagneticLink href="#about" className="hero-action"><span className="circle-icon"><ArrowRight aria-hidden="true" /></span><span>Explore my career</span></MagneticLink>
              <div className="hero-secondary-links">
                <MagneticLink href="#executive-series"><span>Navigate to my Executive Series</span><ArrowUpRight aria-hidden="true" /></MagneticLink>
                <MagneticLink href="#experimentation"><span>My experiment with multimodal AI</span><ArrowUpRight aria-hidden="true" /></MagneticLink>
              </div>
            </nav>
            <SoundEntry />
          </div>
          <div className="hero-bottom"><nav aria-label="Transformation chapters"><a href="#case-1">Banking</a><span>/</span><a href="#case-2">Media</a><span>/</span><a href="#case-3">Retail</a></nav><ScrollCue /></div>
        </div>
      </section>

      <section className="about" id="about" aria-labelledby="about-title">
        <div className="about-heading"><h2 id="about-title" data-reveal>Built through<br /><em>experience.</em></h2><p>16+ years across engineering, consulting, enterprise delivery, and leadership.</p><p>Experience across India, Singapore, and the United States shaped a practical leadership style: technically grounded, commercially aware, and built for complex organizations.</p></div>
        <div className="timeline">{timeline.map(item => <article className="timeline-row" key={item.years} data-reveal><span>{item.years}</span><div><h3>{item.role}</h3><strong>{item.company}</strong><p>{item.note}</p></div></article>)}</div>
        <details className="credentials"><summary>Education &amp; selected credentials <Plus /></summary><ul><li><strong>MBA, Organizational Leadership</strong><span>Eastern University · 2026 · GPA 3.88</span></li><li><strong>BE, Computer Engineering</strong><span>University of Pune</span></li><li><strong>Building Reliable Conversational Agents with Genie</strong><span>Databricks Academy · 2026</span></li><li><strong>Forward Program</strong><span>McKinsey.org · 2025</span></li><li><strong>Google Data Analytics · SAFe 5 PO/PM</strong><span>2022 · 2021</span></li></ul></details>
      </section>

      <section className="manifesto" aria-label="Leadership perspective">
        <div className="manifesto-top"><span>Strategy. Systems. Lasting change.</span><ArrowDown /></div>
        <p data-reveal>I turn complex data into <strong>trusted decisions</strong> and lasting capability.</p>
        <div className="manifesto-bottom"><span>Enterprise perspective.<br />A builder’s instinct.</span><span>India → Singapore → United States</span></div>
      </section>

      <TransformationJourney />

      <section className="leadership" id="leadership" aria-labelledby="leadership-title">
        <h2 id="leadership-title" data-reveal>Strategy is only the start.</h2>
        <p className="leadership-intro">Strategy becomes real through the system around it. My leadership operating system moves from decision framing to durable capability.</p>
        <div className="operating-model">{operatingModel.map(item => <article key={item.number} className="operating-step" data-reveal><span className="operating-number">{item.number}</span><div><h3>{item.title}</h3><p>{item.text}</p></div><ArrowDown /></article>)}</div>
        <blockquote data-reveal>“The goal is not a smarter dashboard. It is a stronger decision, made repeatedly.”</blockquote>
      </section>

      <ProductJourney>
        <div className="products-heading"><h2 id="products-title" data-reveal>I still<br /><em>build.</em></h2><p>Personal products that turn noisy information into a clear next decision.</p></div>
        <div className="product-track">
        <article className="product-feature valora-feature" data-reveal>
          <div className="product-presentation valora-presentation"><span className="product-brand">Valora</span><div className="valora-mark" aria-hidden="true"><i /><i /><i /><i /><i /></div><p>From scattered inputs.<br /><strong>To a clearer property decision.</strong></p><span className="product-preview-label">Property intelligence / Maharashtra-first</span></div>
          <div className="product-description"><h3>Property intelligence<br />from whatever you have.</h3><p>Built to organize messy property inputs into sourced facts that a buyer can confirm before analysis begins. Maharashtra-first, with explicit evidence and risk boundaries.</p><MagneticLink href="https://indiaproperty-iq.lovable.app/analyze/" external className="arrow-link">Explore Valora <ArrowUpRight /></MagneticLink></div>
        </article>
        <article className="product-feature worth-feature" data-reveal>
          <div className="product-presentation worth-presentation"><span className="product-brand">Worth it?</span><div className="worth-type" aria-hidden="true">YES.<br /><span>NO.</span><br />KNOW.</div><span className="product-preview-label">A clearer answer before you buy.</span></div>
          <div className="product-description"><h3>Know the value.<br />Make the call.</h3><p>A working AI deal advisor for marketplace listings. It turns a URL, image, or description into a value range, decision signals, and a practical negotiation starting point.</p><div className="product-links"><MagneticLink href="https://is-it-worth-it-gray.vercel.app" external className="arrow-link">Explore Worth It? <ArrowUpRight /></MagneticLink><a href="https://github.com/dhirajraikantiwar/is-it-worth-it" target="_blank" rel="noreferrer" className="code-link"><GithubLogo /> View code</a></div></div>
        </article>
        </div>
      </ProductJourney>

      <section className="executive-series" id="executive-series" aria-labelledby="series-title">
        <div className="series-header"><h2 id="series-title" data-reveal>Decisions before<br /><em>dashboards.</em></h2><p>The Executive Series. Short, evidence-led briefings on the business choices behind data, AI, and market performance.</p></div>
        <div className="episodes">{episodes.map(episode => <a className="episode" href={episode.url} target="_blank" rel="noreferrer" key={episode.number}><span className="episode-number">{episode.number}</span><div><h3>{episode.title}</h3><p>{episode.subject}</p></div><span className="episode-play"><Play weight="fill" /><span>Watch on LinkedIn</span></span><ArrowUpRight className="episode-arrow" /></a>)}</div>
      </section>

      <CreativeExperiment />

      <section className="contact" id="contact" aria-labelledby="contact-title">
        <p>Let’s turn your most complex data into an advantage.</p>
        <MagneticLink href="mailto:drai2009@gmail.com" className="contact-main"><h2 id="contact-title">Let’s talk.</h2><ArrowUpRight /></MagneticLink>
        <div className="contact-links"><a href="https://www.linkedin.com/in/dhiraj-raikantiwar-20501715/" target="_blank" rel="noreferrer"><LinkedinLogo /> LinkedIn <ArrowUpRight /></a><a href="https://github.com/dhirajraikantiwar" target="_blank" rel="noreferrer"><GithubLogo /> GitHub <ArrowUpRight /></a><a id="resume" href="/Dhiraj_Raikantiwar_Executive_Resume.pdf" download>Download résumé <ArrowDown /></a></div>
        <footer><a href="#top">Dhiraj Raikantiwar <ArrowUpRight /></a><span>Data. AI. Transformation.</span><span>DFW, Texas</span></footer>
      </section>
    </main>
  </Experience>;
}
