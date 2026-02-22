import { useState, useEffect, lazy, Suspense } from 'react';
import '../styles/LandingPage.css';

const HeroCanvas = lazy(() => import('./HeroCanvas'));

function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* Modern Background with Animated Grid */}
      <div className="modern-bg">
        <div className="gradient-overlay"></div>
        <div className="grid-pattern"></div>
        <div className="animated-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`landing-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="logo">
            <img src="/logo.png" alt="YojnaMitra" className="logo-image" />
            <span className="logo-text">YojnaMitra</span>
          </div>
          <div className="nav-links">
            <a href="#schemes">Explore Schemes</a>
            <a href="#eligibility">Check Eligibility</a>
            <a href="#support">Support</a>
            <a href="#features">Features</a>
          </div>
          <div className="nav-actions">
            <a
              href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_BOT_NUMBER || ''}?text=Hi`}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-cta"
            >
              💬 Chat on WhatsApp
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Trusted by 10,000+ Farmers
            </div>
            <h1 className="hero-title">
              Financial Support
              <span className="gradient-text">You Can Trust.</span>
            </h1>
            <p className="hero-description">
              Leveraging technology to bring unprecedented transparency to agricultural financing.
              Answer 8 quick questions on WhatsApp and get a personalised list of schemes you're eligible for.
            </p>
            <div className="hero-actions">
              <a
                href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_BOT_NUMBER || ''}?text=Hi`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <span>Check Your Eligibility on WhatsApp</span>
                <span className="btn-icon">→</span>
              </a>
            </div>
            <div className="hero-stats-bottom">
              <div className="stat-card">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Farmers Assisted</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">50+</div>
                <div className="stat-label">Schemes Available</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">94%</div>
                <div className="stat-label">Success Rate</div>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <Suspense fallback={null}>
              <HeroCanvas />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-box">
            <div className="stat-number">10,000+</div>
            <div className="stat-label">Farmers Assisted</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">50+</div>
            <div className="stat-label">Govt Schemes</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">₹5.2Cr+</div>
            <div className="stat-label">Benefits Disbursed</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">94%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="features-grid">

            <div className="feature-card feature-card--teal">
              <div className="feature-icon-wrapper">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                  <path d="M11 8v3l2 2"/>
                </svg>
              </div>
              <div className="feature-card-body">
                <h3>Smart Matching</h3>
                <p>AI-powered system matches you with the most relevant schemes based on your profile</p>
                <ul className="feature-list">
                  <li>Personalized recommendations</li>
                  <li>Eligibility checker</li>
                  <li>Best fit analysis</li>
                </ul>
              </div>
            </div>

            <div className="feature-card feature-card--green">
              <div className="feature-icon-wrapper">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <path d="M2 10h20"/>
                  <path d="M6 15h4"/>
                  <path d="M14 15h2"/>
                </svg>
              </div>
              <div className="feature-card-body">
                <h3>Financial Support</h3>
                <p>Access loans, subsidies, and insurance schemes tailored to your needs</p>
                <ul className="feature-list">
                  <li>Low-interest loans</li>
                  <li>Crop insurance</li>
                  <li>Equipment subsidies</li>
                </ul>
              </div>
            </div>

            <div className="feature-card feature-card--emerald">
              <div className="feature-icon-wrapper">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <div className="feature-card-body">
                <h3>Insurance Help</h3>
                <p>Get matched with the right crop and farm insurance schemes to protect your livelihood</p>
                <ul className="feature-list">
                  <li>Crop insurance</li>
                  <li>Disaster relief schemes</li>
                  <li>Govt-backed coverage</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Two Ways to Access ── */}
      <section id="how-it-works" className="two-paths-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">Choose Your Way</div>
            <h2 className="section-title">Two Ways to Find Your Schemes</h2>
            <p className="section-description">
              Use our website for a full dashboard experience, or chat on WhatsApp for an instant personalised link — whichever works for you.
            </p>
          </div>

          <div className="two-paths-grid">

            {/* ── WhatsApp Path ── */}
            <div className="path-card path-whatsapp">
              <div className="path-icon-wrap path-icon-wa">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <h3 className="path-title">Use WhatsApp</h3>
              <p className="path-subtitle">No sign-up · Works on any phone · Instant link</p>
              <ol className="path-steps">
                <li><span className="step-num">1</span> Send <strong>"Hi"</strong> to our WhatsApp bot</li>
                <li><span className="step-num">2</span> Answer 8 quick questions in the chat (takes ~3 minutes)</li>
                <li><span className="step-num">3</span> Receive a personalised link — tap to see your matched schemes</li>
              </ol>
              <a
                href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_BOT_NUMBER || ''}?text=Hi`}
                target="_blank"
                rel="noopener noreferrer"
                className="path-cta path-cta-wa"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{flexShrink:0}}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="benefits-section">
        <div className="section-container">
          <div className="benefits-grid">
            <div className="benefits-content">
              <div className="section-badge">Key Benefits</div>
              <h2 className="section-title">Why Thousands of Farmers Trust Us</h2>
              <div className="benefits-list">
                <div className="benefit-item">
                  <div className="benefit-content">
                    <h4>Save Time</h4>
                    <p>Reduce application time from weeks to minutes with our streamlined process</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-content">
                    <h4>Maximize Benefits</h4>
                    <p>Don't miss out on schemes you're eligible for - we find them all for you</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-content">
                    <h4>Expert Guidance</h4>
                    <p>Get help from agricultural experts throughout your application journey</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-content">
                    <h4>Community Support</h4>
                    <p>Connect with fellow farmers and share experiences and knowledge</p>
                  </div>
                </div>
              </div>
              <a
                href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_BOT_NUMBER || ''}?text=Hi`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                Start Now on WhatsApp →
              </a>
            </div>
            <div className="benefits-visual">
              <div className="benefit-image-card">
                <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop" alt="Farmer" />
                <div className="image-overlay">
                  <div className="overlay-stat">
                    <div className="overlay-number">₹2.5L</div>
                    <div className="overlay-label">Avg. Benefit</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-section">
            <div className="footer-logo">
              <img src="/logo.png" alt="YojnaMitra" className="footer-logo-img" />
              <span className="logo-text">YojnaMitra</span>
            </div>
            <p className="footer-description">
              Empowering farmers with easy access to government schemes and financial support.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link">Facebook</a>
              <a href="#" className="social-link">Twitter</a>
              <a href="#" className="social-link">Instagram</a>
            </div>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Platform</h4>
              <a href="#">Features</a>
              <a href="#">How it Works</a>
              <a href="#">Pricing</a>
              <a href="#">Success Stories</a>
            </div>
            <div className="link-group">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Contact Us</a>
              <a href="#">FAQs</a>
              <a href="#">Community</a>
            </div>
            <div className="link-group">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
              <a href="#">Disclaimer</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 YojnaMitra. All rights reserved. | A Government of India Initiative</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
