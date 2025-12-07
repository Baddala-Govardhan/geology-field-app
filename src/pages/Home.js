import React, { useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send the form data to a backend
    console.log("Contact form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  return (
    <div style={containerStyle}>
      <div id="home" style={heroSectionStyle}>
        <div style={heroOverlayStyle}></div>
        <div style={heroContentStyle}>
          <h1 style={heroTitleStyle}>
            Geology Field Data
          </h1>
          <p style={heroSubtitleStyle}>
            Advanced field research data collection system
          </p>
          <p style={heroDescriptionStyle}>
            Collect, manage, and analyze geological field data with precision and ease.
            Built for researchers who demand accuracy and reliability.
          </p>
          <div style={formLinksStyle}>
            <Link 
              to="/grain" 
              style={formLinkButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.background = "#7a5f3d";
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 3px 8px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#8b6f47";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
              }}
            >
              Grain Size
            </Link>
            <Link 
              to="/flow" 
              style={formLinkButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.background = "#7a5f3d";
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 3px 8px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "#8b6f47";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
              }}
            >
              Flow Measurement
            </Link>
          </div>
        </div>
      </div>

      <div id="features" style={featuresSectionStyle}>
        <div style={featuresContainerStyle}>
          <h2 style={sectionTitleStyle}>Features</h2>
          <div style={featuresGridStyle}>
            <div style={{...featureCardStyle, animationDelay: "0.1s"}}>
              <div style={featureIconStyle}>📍</div>
              <h3 style={featureTitleStyle}>GPS Integration</h3>
              <p style={featureDescriptionStyle}>
                Automatic location tracking with manual entry fallback
              </p>
            </div>
            <div style={{...featureCardStyle, animationDelay: "0.2s"}}>
              <div style={featureIconStyle}>📊</div>
              <h3 style={featureTitleStyle}>Data Collection</h3>
              <p style={featureDescriptionStyle}>
                Multiple form types for different field measurements
              </p>
            </div>
            <div style={{...featureCardStyle, animationDelay: "0.3s"}}>
              <div style={featureIconStyle}>💾</div>
              <h3 style={featureTitleStyle}>Cloud Sync</h3>
              <p style={featureDescriptionStyle}>
                Real-time synchronization with CouchDB database
              </p>
            </div>
            <div style={{...featureCardStyle, animationDelay: "0.4s"}}>
              <div style={featureIconStyle}>📱</div>
              <h3 style={featureTitleStyle}>Mobile Ready</h3>
              <p style={featureDescriptionStyle}>
                Responsive design works on all devices
              </p>
            </div>
          </div>
        </div>
      </div>

      <div id="contact" style={contactSectionStyle}>
        <div style={contactContainerStyle}>
          <h2 style={sectionTitleStyle}>Contact Us</h2>
          <p style={contactDescriptionStyle}>
            Get in touch with our team for support or inquiries about the Geology Field Data system.
          </p>
          
          {submitted ? (
            <div style={successMessageStyle}>
              <p style={successTextStyle}>Thank you for your message! We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={contactFormStyle}>
              <div style={formRowStyle}>
                <div style={formFieldStyle}>
                  <label style={formLabelStyle}>
                    Name <span style={requiredStyle}>*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={formInputStyle}
                    placeholder="Your name"
                    required
                    onFocus={(e) => {
                      e.target.style.borderColor = "#8b6f47";
                      e.target.style.boxShadow = "0 0 0 3px rgba(139, 111, 71, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                <div style={formFieldStyle}>
                  <label style={formLabelStyle}>
                    Email <span style={requiredStyle}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={formInputStyle}
                    placeholder="your.email@example.com"
                    required
                    onFocus={(e) => {
                      e.target.style.borderColor = "#8b6f47";
                      e.target.style.boxShadow = "0 0 0 3px rgba(139, 111, 71, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e5e7eb";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              <div style={formFieldStyle}>
                <label style={formLabelStyle}>
                  Subject <span style={requiredStyle}>*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  style={formInputStyle}
                  placeholder="Subject of your message"
                  required
                  onFocus={(e) => {
                    e.target.style.borderColor = "#8b6f47";
                    e.target.style.boxShadow = "0 0 0 3px rgba(139, 111, 71, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div style={formFieldStyle}>
                <label style={formLabelStyle}>
                  Message <span style={requiredStyle}>*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  style={formTextareaStyle}
                  placeholder="Your message..."
                  rows="6"
                  required
                  onFocus={(e) => {
                    e.target.style.borderColor = "#8b6f47";
                    e.target.style.boxShadow = "0 0 0 3px rgba(139, 111, 71, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <button 
                type="submit" 
                style={submitButtonStyle}
                onMouseEnter={(e) => {
                  e.target.style.background = "#7a5f3d";
                  e.target.style.transform = "translateY(-1px)";
                  e.target.style.boxShadow = "0 3px 8px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "#8b6f47";
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                }}
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const containerStyle = {
  width: "100%",
  minHeight: "calc(100vh - 200px)",
};

const heroSectionStyle = {
  padding: "6rem 2rem 5rem 2rem",
  textAlign: "center",
  position: "relative",
  background: "#f8f9fa",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23d4a574' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
  borderBottom: "1px solid #e9ecef",
};

const heroOverlayStyle = {
  display: "none",
};

const heroContentStyle = {
  maxWidth: "900px",
  margin: "0 auto",
  animation: "fadeInUp 0.8s ease-out",
};

const heroTitleStyle = {
  fontSize: "clamp(2.5rem, 6vw, 4rem)",
  fontWeight: "600",
  color: "#2c3e50",
  letterSpacing: "-0.02em",
  lineHeight: "1.2",
  margin: "0 0 1rem 0",
  fontFamily: "'Georgia', 'Times New Roman', serif",
};

const heroSubtitleStyle = {
  fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)",
  color: "#5d6d7e",
  fontWeight: "400",
  margin: "0 0 1.5rem 0",
  letterSpacing: "-0.01em",
  lineHeight: "1.5",
};

const heroDescriptionStyle = {
  fontSize: "clamp(1rem, 1.5vw, 1.125rem)",
  color: "#6c757d",
  lineHeight: "1.7",
  margin: "0 0 2rem 0",
  maxWidth: "650px",
  marginLeft: "auto",
  marginRight: "auto",
  fontWeight: "400",
};

const formLinksStyle = {
  display: "flex",
  gap: "1rem",
  justifyContent: "center",
  marginTop: "2rem",
  flexWrap: "wrap",
};

const formLinkButtonStyle = {
  padding: "0.75rem 2rem",
  background: "#8b6f47",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: "500",
  fontSize: "0.9375rem",
  letterSpacing: "0.01em",
  transition: "all 0.2s ease",
  display: "inline-block",
  border: "none",
  cursor: "pointer",
  borderRadius: "4px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
};


const featuresSectionStyle = {
  padding: "5rem 2rem",
  background: "#ffffff",
  borderTop: "1px solid #e9ecef",
};

const featuresContainerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
};

const sectionTitleStyle = {
  fontSize: "clamp(2rem, 4vw, 2.5rem)",
  fontWeight: "600",
  color: "#2c3e50",
  textAlign: "center",
  margin: "0 0 3rem 0",
  letterSpacing: "-0.02em",
  lineHeight: "1.3",
  fontFamily: "'Georgia', 'Times New Roman', serif",
};

const featuresGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "2.5rem",
};

const featureCardStyle = {
  background: "#ffffff",
  padding: "2.5rem 2rem",
  border: "1px solid #dee2e6",
  textAlign: "left",
  transition: "all 0.2s ease",
  animation: "fadeInUp 0.8s ease-out",
  animationFillMode: "both",
  cursor: "pointer",
  borderRadius: "0",
  boxShadow: "none",
};

const featureIconStyle = {
  fontSize: "2.5rem",
  marginBottom: "1.5rem",
  display: "block",
};

const featureTitleStyle = {
  fontSize: "1.25rem",
  fontWeight: "600",
  color: "#2c3e50",
  margin: "0 0 0.75rem 0",
  letterSpacing: "-0.01em",
  lineHeight: "1.4",
};

const featureDescriptionStyle = {
  fontSize: "0.9375rem",
  color: "#6c757d",
  lineHeight: "1.6",
  margin: "0",
  fontWeight: "400",
};

const contactSectionStyle = {
  padding: "5rem 2rem",
  background: "#f8f9fa",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23d4a574' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
  borderTop: "1px solid #e9ecef",
};

const contactContainerStyle = {
  maxWidth: "800px",
  margin: "0 auto",
  textAlign: "center",
};

const contactDescriptionStyle = {
  fontSize: "clamp(1rem, 1.5vw, 1.125rem)",
  color: "#6c757d",
  lineHeight: "1.7",
  margin: "0 0 3rem 0",
  maxWidth: "650px",
  marginLeft: "auto",
  marginRight: "auto",
  fontWeight: "400",
};

const contactFormStyle = {
  background: "#ffffff",
  padding: "2.5rem",
  borderRadius: "0",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  border: "1px solid #dee2e6",
  textAlign: "left",
  maxWidth: "700px",
  margin: "0 auto",
};

const formRowStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "1.5rem",
  marginBottom: "1.75rem",
};

const formFieldStyle = {
  marginBottom: "1.75rem",
};

const formLabelStyle = {
  display: "block",
  marginBottom: "0.625rem",
  fontWeight: "600",
  color: "#374151",
  fontSize: "0.875rem",
  letterSpacing: "-0.01em",
};

const requiredStyle = {
  color: "#ef4444",
  marginLeft: "0.25rem",
};

const formInputStyle = {
  width: "100%",
  padding: "0.75rem 1rem",
  border: "1.5px solid #e5e7eb",
  borderRadius: "8px",
  boxSizing: "border-box",
  fontSize: "0.9375rem",
  fontFamily: "inherit",
  transition: "all 0.2s ease",
  background: "#ffffff",
  color: "#111827",
  letterSpacing: "-0.01em",
};

const formTextareaStyle = {
  ...formInputStyle,
  resize: "vertical",
  minHeight: "120px",
  fontFamily: "inherit",
};

const submitButtonStyle = {
  marginTop: "0.5rem",
  width: "100%",
  padding: "0.875rem 2rem",
  background: "#8b6f47",
  color: "#ffffff",
  border: "none",
  borderRadius: "4px",
  fontWeight: "500",
  fontSize: "0.9375rem",
  cursor: "pointer",
  transition: "all 0.2s ease",
  letterSpacing: "0.01em",
  textAlign: "center",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
};

const successMessageStyle = {
  background: "#ffffff",
  padding: "2.5rem",
  borderRadius: "0",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  border: "1px solid #dee2e6",
  textAlign: "center",
  maxWidth: "700px",
  margin: "0 auto",
};

const successTextStyle = {
  margin: "0",
  color: "#059669",
  fontSize: "1rem",
  fontWeight: "500",
};

export default Home;

