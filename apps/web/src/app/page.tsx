const benefits = [
  {
    number: "01",
    symbol: "⌂",
    title: "A home that fits your life",
    description:
      "Explore shared homes by location, budget, and the details that make a place feel right.",
  },
  {
    number: "02",
    symbol: "◌",
    title: "People you can picture living with",
    description:
      "Get to know potential flatmates through the habits and routines that matter day to day.",
  },
  {
    number: "03",
    symbol: "↗",
    title: "A clearer way to move forward",
    description:
      "Compare your options, start a conversation, and take the next step at your own pace.",
  },
];

const steps = [
  {
    number: "01",
    title: "Tell us what matters",
    description: "Choose a city, a comfortable budget, and the kind of home you want.",
  },
  {
    number: "02",
    title: "Explore your options",
    description: "Browse homes and people with a little more context from the start.",
  },
  {
    number: "03",
    title: "Start a conversation",
    description: "Find a promising fit and connect before making plans to move.",
  },
];

export default function Home() {
  return (
    <main>
      <header className="shell nav">
        <a className="logo" href="/" aria-label="Avenli home">
          avenli<span>.</span>
        </a>

        <nav className="links" aria-label="Main navigation">
          <a href="#discover">Discover</a>
          <a href="#how">How it works</a>
          <a href="#about">Our approach</a>
        </nav>

        <div className="nav-actions">
          <a className="login-link" href="/login">
            Log in
          </a>
          <a className="btn btn-small" href="/signup">
            Get started <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <section className="shell hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            ROOMMATES, REIMAGINED
          </div>
          <h1>
            Find a place
            <br />
            that feels like <em>you.</em>
          </h1>
          <p className="hero-description">
            A thoughtful way to find a home and people to share it with. Start
            with what matters to you, and take your next move one step at a time.
          </p>
          <div className="hero-actions">
            <a className="btn" href="/signup">
              Find your next place <span aria-hidden="true">↗</span>
            </a>
            <a className="text-link" href="#how">
              See how it works <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-notes" aria-label="What you can explore">
            <span>Rooms & shared homes</span>
            <span>Budgets that work for you</span>
            <span>People, not just profiles</span>
          </div>
        </div>

        <div className="hero-showcase" aria-label="Example shared home listing">
          <div className="showcase-orbit orbit-one" aria-hidden="true" />
          <div className="showcase-orbit orbit-two" aria-hidden="true" />
          <div className="home-illustration" aria-hidden="true">
            <div className="illustration-sun" />
            <div className="illustration-window">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="illustration-shelf" />
            <div className="illustration-plant plant-left">
              <i />
              <i />
              <i />
            </div>
            <div className="illustration-plant plant-right">
              <i />
              <i />
              <i />
            </div>
            <div className="illustration-sofa">
              <span />
              <span />
            </div>
            <div className="illustration-table" />
          </div>

          <div className="floating-note">
            <span className="note-icon" aria-hidden="true">✳</span>
            <span>
              <strong>Good living starts here</strong>
              <small>Make room for what matters</small>
            </span>
          </div>

          <article className="listing-card">
            <div className="listing-topline">
              <span className="listing-location">SAMPLE HOME · BENGALURU</span>
              <span className="listing-heart" aria-label="Featured home">♡</span>
            </div>
            <h2>A bright room, with room to breathe.</h2>
            <div className="listing-details">
              <span>Shared home</span>
              <span className="detail-dot" aria-hidden="true" />
              <span>Near cafés & the metro</span>
            </div>
            <div className="listing-bottom">
              <span className="listing-price">
                <strong>₹14,500</strong>
                <small>/ month</small>
              </span>
              <span className="listing-arrow" aria-hidden="true">↗</span>
            </div>
          </article>
          <div className="showcase-caption">ILLUSTRATIVE LISTING · A PLACE TO LAND</div>
        </div>
      </section>

      <section className="shell intro-section" id="discover">
        <div className="section-heading">
          <div>
            <div className="eyebrow">MADE FOR REAL LIFE</div>
            <h2>A move is about more than an address.</h2>
          </div>
          <p>
            The right home is a feeling, a routine, and the people around your
            table. Find the pieces that fit you.
          </p>
        </div>

        <div className="benefit-grid" id="about">
          {benefits.map((benefit) => (
            <article className="benefit-card" key={benefit.number}>
              <div className="benefit-card-top">
                <span className="benefit-symbol" aria-hidden="true">
                  {benefit.symbol}
                </span>
                <span className="benefit-number">{benefit.number}</span>
              </div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="steps-section" id="how">
        <div className="shell steps-content">
          <div className="steps-heading">
            <div className="eyebrow eyebrow-light">A CALMER WAY TO GET THERE</div>
            <h2>Your next chapter, in three steps.</h2>
            <p>No rush. Start with a search, then see where a good conversation takes you.</p>
          </div>
          <div className="steps-grid">
            {steps.map((step) => (
              <article className="step-card" key={step.number}>
                <span className="step-number">{step.number}</span>
                <div className="step-rule" />
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
          <div className="steps-footer">
            <span>Thoughtful choices make a better move.</span>
            <a href="/signup">
              Take the first step <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="shell closing-section">
        <div className="closing-card">
          <div className="closing-spark" aria-hidden="true">✳</div>
          <div>
            <div className="eyebrow eyebrow-light">A GOOD PLACE TO BEGIN</div>
            <h2>Make space for what’s next.</h2>
            <p>Start exploring homes and people who could make a new city feel familiar.</p>
          </div>
          <a className="btn btn-light" href="/signup">
            Join the waitlist <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <footer className="shell footer">
        <a className="logo" href="/" aria-label="Avenli home">
          avenli<span>.</span>
        </a>
        <p>Find your people. Find your place.</p>
        <span>© {new Date().getFullYear()} Avenli · Early concept</span>
      </footer>
    </main>
  );
}
