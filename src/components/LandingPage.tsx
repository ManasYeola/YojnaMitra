import '../styles/LandingPage.css';

interface LandingPageProps {
  onGetStarted: () => void;
}

function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="landing-page">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">🌾</span>
            <span className="logo-text">FarmerSupport</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#benefits">Benefits</a>
            <a href="#testimonials">Testimonials</a>
          </div>
          <button className="nav-cta" onClick={onGetStarted}>
            Get Started
          </button>
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
              Your Gateway to
              <span className="gradient-text"> Agricultural Prosperity</span>
            </h1>
            <p className="hero-description">
              Access government schemes, insurance, loans, and subsidies all in one place. 
              We simplify the journey from application to approval with personalized recommendations.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={onGetStarted}>
                <span>Start Your Journey</span>
                <span className="btn-icon">→</span>
              </button>
              <button className="btn-secondary">
                <span className="play-icon">▶</span>
                Watch Demo
              </button>
            </div>
            <div className="hero-trust">
              <div className="trust-item">
                <span className="trust-icon">✓</span>
                <span>No Hidden Fees</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">✓</span>
                <span>100% Secure</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">✓</span>
                <span>Government Verified</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-card card-1">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <div className="card-title">Track Applications</div>
                <div className="card-value">Real-time Updates</div>
              </div>
            </div>
            <div className="visual-card card-2">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <div className="card-title">Total Benefits</div>
                <div className="card-value">₹5.2 Cr+</div>
              </div>
            </div>
            <div className="visual-card card-3">
              <div className="card-icon">🎯</div>
              <div className="card-content">
                <div className="card-title">Success Rate</div>
                <div className="card-value">94%</div>
              </div>
            </div>
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
          <div className="section-header">
            <div className="section-badge">Why Choose Us</div>
            <h2 className="section-title">Everything You Need in One Platform</h2>
            <p className="section-description">
              Comprehensive tools and resources designed specifically for farmers
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🎯</span>
              </div>
              <h3>Smart Matching</h3>
              <p>AI-powered system matches you with the most relevant schemes based on your profile</p>
              <ul className="feature-list">
                <li>Personalized recommendations</li>
                <li>Eligibility checker</li>
                <li>Best fit analysis</li>
              </ul>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">⚡</span>
              </div>
              <h3>Quick Application</h3>
              <p>Apply to multiple schemes with minimal information and documentation</p>
              <ul className="feature-list">
                <li>One-time registration</li>
                <li>Auto-fill forms</li>
                <li>Bulk applications</li>
              </ul>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">📱</span>
              </div>
              <h3>Real-time Tracking</h3>
              <p>Monitor your application status and get instant updates on approvals</p>
              <ul className="feature-list">
                <li>Status notifications</li>
                <li>Timeline tracking</li>
                <li>SMS & Email alerts</li>
              </ul>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">💰</span>
              </div>
              <h3>Financial Support</h3>
              <p>Access loans, subsidies, and insurance schemes tailored to your needs</p>
              <ul className="feature-list">
                <li>Low-interest loans</li>
                <li>Crop insurance</li>
                <li>Equipment subsidies</li>
              </ul>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🌐</span>
              </div>
              <h3>Multilingual Support</h3>
              <p>Use the platform in your preferred language for better understanding</p>
              <ul className="feature-list">
                <li>10+ languages</li>
                <li>Voice assistance</li>
                <li>Regional support</li>
              </ul>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <span className="feature-icon">🛡️</span>
              </div>
              <h3>Secure & Safe</h3>
              <p>Your data is protected with bank-level security and encryption</p>
              <ul className="feature-list">
                <li>256-bit encryption</li>
                <li>Data privacy</li>
                <li>Govt compliance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">Simple Process</div>
            <h2 className="section-title">Get Started in 3 Easy Steps</h2>
            <p className="section-description">
              From registration to approval, we've made it incredibly simple
            </p>
          </div>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">01</div>
              <div className="step-content">
                <h3>Create Your Profile</h3>
                <p>Share basic information about your farm, crops, and land. Takes less than 2 minutes.</p>
                <div className="step-features">
                  <span>Quick registration</span>
                  <span>Minimal details</span>
                </div>
              </div>
              <div className="step-visual">
                <div className="step-icon">📝</div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">02</div>
              <div className="step-content">
                <h3>Discover Schemes</h3>
                <p>View personalized scheme recommendations matched to your profile and requirements.</p>
                <div className="step-features">
                  <span>Smart suggestions</span>
                  <span>Eligibility check</span>
                </div>
              </div>
              <div className="step-visual">
                <div className="step-icon">🔍</div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">03</div>
              <div className="step-content">
                <h3>Apply & Track</h3>
                <p>Submit applications and track their progress in real-time until approval.</p>
                <div className="step-features">
                  <span>One-click apply</span>
                  <span>Live tracking</span>
                </div>
              </div>
              <div className="step-visual">
                <div className="step-icon">✅</div>
              </div>
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
                  <div className="benefit-icon">⏱️</div>
                  <div className="benefit-content">
                    <h4>Save Time</h4>
                    <p>Reduce application time from weeks to minutes with our streamlined process</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">💵</div>
                  <div className="benefit-content">
                    <h4>Maximize Benefits</h4>
                    <p>Don't miss out on schemes you're eligible for - we find them all for you</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">📚</div>
                  <div className="benefit-content">
                    <h4>Expert Guidance</h4>
                    <p>Get help from agricultural experts throughout your application journey</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">🤝</div>
                  <div className="benefit-content">
                    <h4>Community Support</h4>
                    <p>Connect with fellow farmers and share experiences and knowledge</p>
                  </div>
                </div>
              </div>
              <button className="btn-primary" onClick={onGetStarted}>
                Start Now - It's Free
              </button>
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

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">Success Stories</div>
            <h2 className="section-title">What Farmers Say About Us</h2>
            <p className="section-description">
              Real stories from farmers who transformed their lives
            </p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "I received ₹50,000 subsidy for my new tractor within 2 weeks. The process was so simple, I couldn't believe it!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍🌾</div>
                <div className="author-info">
                  <div className="author-name">Ramesh Kumar</div>
                  <div className="author-location">Punjab</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "Never knew I was eligible for so many schemes. This platform found 7 schemes I could apply to!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">👩‍🌾</div>
                <div className="author-info">
                  <div className="author-name">Sunita Devi</div>
                  <div className="author-location">Maharashtra</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "The crop insurance I got through this platform saved my family during the drought. Forever grateful!"
              </p>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍🌾</div>
                <div className="author-info">
                  <div className="author-name">Vijay Patel</div>
                  <div className="author-location">Gujarat</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2>Ready to Transform Your Farming Journey?</h2>
            <p>Join thousands of farmers who are already benefiting from government schemes</p>
            <button className="btn-cta" onClick={onGetStarted}>
              <span>Get Started Free</span>
              <span className="btn-icon">→</span>
            </button>
            <p className="cta-note">No credit card required • 100% Free • Takes 2 minutes</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">🌾</span>
              <span className="logo-text">FarmerSupport</span>
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
          <p>&copy; 2026 FarmerSupport. All rights reserved. | A Government of India Initiative</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
