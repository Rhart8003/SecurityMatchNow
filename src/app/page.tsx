import Link from "next/link";
import { Header } from "@/components/header";
import { services } from "@/lib/services";
import { launchMarkets } from "@/lib/markets";

const quickServices = [
  { label: "Event Security", slug: "event-security" },
  { label: "Construction", slug: "construction-security" },
  { label: "Mobile Patrol", slug: "mobile-patrol" },
  { label: "Armed Security", slug: "armed-security" },
];

export default function HomePage() {
  const featuredMarkets = launchMarkets.filter((market) => market.phase <= 2).slice(0, 3);

  return (
    <main>
      <Header />

      <section className="hero home-hero">
        <div className="home-hero-glow home-hero-glow-red" />
        <div className="home-hero-glow home-hero-glow-gold" />

        <div className="container hero-grid home-hero-grid">
          <div className="hero-copy home-hero-copy">
            <div className="eyebrow">NATIONWIDE PRIVATE SECURITY MARKETPLACE</div>
            <h1>Find the right security company. <span>Fast.</span></h1>
            <p className="hero-lead">
              Tell SecurityMatch what you need, where you need it, and when. We connect your request with security providers whose services and coverage areas fit the assignment.
            </p>

            <form action="/find-security" className="zip-search home-search">
              <label htmlFor="zip">Start with the ZIP code where coverage is needed</label>
              <div className="zip-row home-zip-row">
                <div className="zip-input-wrap">
                  <span className="zip-pin" aria-hidden="true">⌖</span>
                  <input id="zip" name="zip" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} placeholder="Enter ZIP code" aria-label="ZIP code" required />
                </div>
                <button className="button button-primary home-search-button" type="submit">Find Security <span aria-hidden="true">→</span></button>
              </div>
            </form>

            <div className="quick-needs" aria-label="Popular security services">
              <span>Popular:</span>
              {quickServices.map((item) => (
                <Link key={item.slug} href={"/find-security?service=" + item.slug}>{item.label}</Link>
              ))}
            </div>

            <div className="home-hero-actions">
              <Link href="/find-security?urgent=1" className="urgent-link home-urgent-link"><span>⚡</span> Need security now?</Link>
              <Link href="/provider/join" className="provider-text-link">Security company? Join the network →</Link>
            </div>

            <div className="home-proof-line">
              <span>Free to request</span>
              <i />
              <span>Compare quotes</span>
              <i />
              <span>No obligation to choose</span>
            </div>
          </div>

          <aside className="match-card home-match-card" aria-label="How SecurityMatch matches a request">
            <div className="match-card-top">
              <div><span className="status-dot" /> How your request moves</div>
              <span className="verified-pill">SecurityMatch</span>
            </div>

            <div className="match-location">Example workflow · Customer request</div>
            <h2>One request. A clearer path to qualified options.</h2>

            <div className="match-flow">
              <div className="match-flow-item complete">
                <div className="match-flow-icon">01</div>
                <div><strong>Tell us the assignment</strong><span>ZIP, service type, schedule, officer count and requirements.</span></div>
                <b>✓</b>
              </div>
              <div className="match-flow-item active">
                <div className="match-flow-icon">02</div>
                <div><strong>We identify provider fits</strong><span>Location, service fit, verification and responsiveness inform matching.</span></div>
                <b>↗</b>
              </div>
              <div className="match-flow-item">
                <div className="match-flow-icon">03</div>
                <div><strong>You compare and choose</strong><span>Review provider information and quotes before selecting a company.</span></div>
                <b>→</b>
              </div>
            </div>

            <div className="match-note">Paid provider placement is labeled separately from the organic match score.</div>
          </aside>
        </div>
      </section>

      <section className="trust-strip home-trust-strip">
        <div className="container trust-grid">
          <div><strong>Service-area matching</strong><span>Providers define where they are prepared to work</span></div>
          <div><strong>Verification indicators</strong><span>Licensing, insurance and workers’ comp status can be surfaced</span></div>
          <div><strong>Quote comparison</strong><span>Review multiple proposals in one customer dashboard</span></div>
          <div><strong>Urgent requests</strong><span>Flag rapid-response security needs from the start</span></div>
        </div>
      </section>

      <section className="section audience-section">
        <div className="container">
          <div className="center-heading audience-heading">
            <span className="eyebrow">ONE MARKETPLACE · TWO CLEAR PATHS</span>
            <h2>Built for people buying security—and the companies providing it.</h2>
          </div>

          <div className="audience-grid">
            <article className="audience-card customer-card">
              <div className="audience-card-kicker">FOR CUSTOMERS</div>
              <div className="audience-icon">◎</div>
              <h3>I need security coverage</h3>
              <p>Describe the job once, then use SecurityMatch to organize matched providers and compare quotes.</p>
              <div className="audience-points">
                <span>Event & venue security</span>
                <span>Construction & commercial</span>
                <span>Patrol, fire watch & more</span>
              </div>
              <Link href="/find-security" className="button button-primary">Find Security <span aria-hidden="true">→</span></Link>
            </article>

            <article className="audience-card provider-card">
              <div className="audience-card-kicker gold">FOR SECURITY PROVIDERS</div>
              <div className="audience-icon gold-icon">◆</div>
              <h3>I want qualified opportunities</h3>
              <p>Create your company profile, define services and territories, and quote assignments that fit your operation.</p>
              <div className="audience-points">
                <span>Basic profile available</span>
                <span>Paid visibility plans</span>
                <span>Founding Provider program</span>
              </div>
              <div className="audience-provider-actions">
                <Link href="/provider/join" className="button button-light">Join as Provider</Link>
                <Link href="/providers" className="text-link">View plans →</Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-muted" id="services">
        <div className="container">
          <div className="section-heading">
            <div><span className="eyebrow">SECURITY SERVICES</span><h2>Start with what you need protected.</h2></div>
            <Link href="/find-security" className="text-link">Start a request →</Link>
          </div>
          <div className="service-grid home-service-grid">
            {services.slice(0, 8).map((service, index) => (
              <Link key={service.slug} href={"/find-security?service=" + service.slug} className="service-card home-service-card">
                <div className="service-card-top">
                  <span className="service-icon">{service.icon}</span>
                  <span className="service-number">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <span className="card-arrow">Request this service →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="container">
          <div className="center-heading">
            <span className="eyebrow">HOW SECURITYMATCH WORKS</span>
            <h2>From security need to provider selection.</h2>
            <p className="section-support">The marketplace keeps the request, provider fit and quote process in one place.</p>
          </div>
          <div className="steps home-steps">
            <div className="step"><span>01</span><h3>Build the request</h3><p>Enter the location, service, dates, officer type, staffing level and assignment details.</p></div>
            <div className="step"><span>02</span><h3>Review provider fits</h3><p>SecurityMatch evaluates service area and service fit, with verification and response signals included in the match model.</p></div>
            <div className="step"><span>03</span><h3>Compare quotes</h3><p>Use your dashboard to review proposals and select the provider that works for your assignment.</p></div>
          </div>
        </div>
      </section>

      <section className="section section-muted home-markets-section">
        <div className="container">
          <div className="section-heading home-markets-heading">
            <div><span className="eyebrow">MARKET ROLLOUT</span><h2>Growing provider density one market at a time.</h2><p className="section-support left">SecurityMatch can accept requests broadly while provider recruitment is focused in launch markets.</p></div>
            <Link href="/markets" className="text-link">Explore rollout markets →</Link>
          </div>
          <div className="market-grid home-market-grid">
            {featuredMarkets.map((market) => (
              <Link href={"/markets/" + market.slug} className={"market-card phase-" + market.phase} key={market.slug}>
                <span className="market-phase">{market.phaseLabel}</span>
                <h2>{market.name}, {market.state}</h2>
                <p>{market.pitch}</p>
                <div className="market-tags">{market.verticals.slice(0,3).map((vertical) => <span key={vertical}>{vertical}</span>)}</div>
                <b>View market →</b>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="provider-cta home-provider-cta">
        <div className="container provider-cta-grid">
          <div>
            <span className="eyebrow light">GROW WITH SECURITYMATCH</span>
            <h2>Security companies: turn open capacity into new revenue.</h2>
            <p>Build your marketplace profile, define your territory, and position your company for customer requests that fit the services you already provide.</p>
            <div className="provider-feature-row"><span>Basic $0</span><span>Verified $49/mo</span><span>Professional $149/mo</span><span>Prime $399/mo</span></div>
          </div>
          <div className="provider-cta-actions">
            <Link href="/provider/join" className="button button-light">Join the Network</Link>
            <Link href="/founding-providers" className="button button-outline-light">Founding Provider Program</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-row"><span>© 2026 SecurityMatch · SecurityMatchNow.com</span><span>Private security marketplace · United States</span></div>
      </footer>
    </main>
  );
}
