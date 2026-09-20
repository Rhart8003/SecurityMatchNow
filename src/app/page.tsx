import Link from "next/link";
import { Header } from "@/components/header";
import { services } from "@/lib/services";

export default function HomePage() {
  return (
    <main>
      <Header />
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">SECURITY, MATCHED TO YOUR NEED</div>
            <h1>Professional security.<br/><span>Wherever you need it.</span></h1>
            <p className="hero-lead">Tell us what you need and SecurityMatch connects you with qualified security providers serving your area.</p>
            <form action="/find-security" className="zip-search">
              <label htmlFor="zip">Where do you need security?</label>
              <div className="zip-row">
                <input id="zip" name="zip" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} placeholder="Enter ZIP code" aria-label="ZIP code" required />
                <button className="button button-primary" type="submit">Find Security</button>
              </div>
            </form>
            <div className="hero-links">
              <Link href="/find-security?urgent=1" className="urgent-link">⚡ Need security now?</Link>
              <span>Fast, free request. No obligation.</span>
            </div>
          </div>

          <div className="match-card" aria-label="Sample provider match">
            <div className="match-card-top">
              <div>
                <span className="status-dot" /> Example match preview
              </div>
              <span className="verified-pill">Verified</span>
            </div>
            <div className="match-location">Fresno, CA · 93721</div>
            <h2>See qualified providers and match scores</h2>
            <div className="provider-mini">
              <div className="avatar">CV</div>
              <div><strong>Central Valley Security</strong><span>Event · Patrol · Unarmed</span></div>
              <b>96%</b>
            </div>
            <div className="provider-mini">
              <div className="avatar">PS</div>
              <div><strong>Premier Security Group</strong><span>Armed · Commercial · Fire Watch</span></div>
              <b>92%</b>
            </div>
            <div className="provider-mini">
              <div className="avatar">SP</div>
              <div><strong>SafePoint Protective</strong><span>Construction · Mobile Patrol</span></div>
              <b>89%</b>
            </div>
            <div className="match-note">Match scores consider location, service fit, verification and responsiveness.</div>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="container trust-grid">
          <div><strong>Qualified providers</strong><span>Designed around licensing and verification</span></div>
          <div><strong>Compare quotes</strong><span>Review options before you choose</span></div>
          <div><strong>Local matching</strong><span>ZIP-based service-area matching</span></div>
          <div><strong>Urgent coverage</strong><span>Rapid-response request option</span></div>
        </div>
      </section>

      <section className="section" id="services">
        <div className="container">
          <div className="section-heading">
            <div><span className="eyebrow">SECURITY SERVICES</span><h2>What do you need protected?</h2></div>
            <Link href="/find-security" className="text-link">View all services →</Link>
          </div>
          <div className="service-grid">
            {services.slice(0, 8).map((service) => (
              <Link key={service.slug} href={`/find-security?service=${service.slug}`} className="service-card">
                <span className="service-icon">{service.icon}</span>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <span className="card-arrow">Get matched →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-muted" id="how-it-works">
        <div className="container">
          <div className="center-heading"><span className="eyebrow">HOW IT WORKS</span><h2>Security in three simple steps</h2></div>
          <div className="steps">
            <div className="step"><span>01</span><h3>Tell us what you need</h3><p>Enter your ZIP code, service type, dates, hours and coverage requirements.</p></div>
            <div className="step"><span>02</span><h3>Get matched</h3><p>We identify providers whose services and coverage areas fit your request.</p></div>
            <div className="step"><span>03</span><h3>Compare and choose</h3><p>Review provider information and quotes, then select the company that fits your needs.</p></div>
          </div>
        </div>
      </section>

      <section className="provider-cta">
        <div className="container provider-cta-grid">
          <div><span className="eyebrow light">FOR SECURITY COMPANIES</span><h2>Turn your open capacity into new revenue.</h2><p>Join SecurityMatch and receive opportunities that fit the services and territories your company already covers.</p></div>
          <div className="provider-cta-actions"><Link href="/provider/join" className="button button-light">Join as a Provider</Link><Link href="/providers" className="button button-outline-light">See Provider Plans</Link></div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-row"><span>© 2026 SecurityMatch. SecurityMatchNow.com</span><span>Private security marketplace · United States</span></div>
      </footer>
    </main>
  );
}
