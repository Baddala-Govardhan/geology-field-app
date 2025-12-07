import React, { useState } from "react";

function Contact() {
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
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h2 style={titleStyle}>Contact Us</h2>
          <p style={descriptionStyle}>Get in touch with our team</p>
        </div>

        {submitted ? (
          <div style={successStyle}>
            <p style={successTextStyle}>Thank you for your message! We'll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                Name <span style={requiredStyle}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={inputStyle}
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

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                Email <span style={requiredStyle}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={inputStyle}
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

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                Subject <span style={requiredStyle}>*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                style={inputStyle}
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

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>
                Message <span style={requiredStyle}>*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                style={textareaStyle}
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
              style={buttonStyle}
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
  );
}

const containerStyle = {
  width: "100%",
  padding: "3rem 2rem",
  background: "#f8f9fa",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23d4a574' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
  minHeight: "calc(100vh - 200px)",
  position: "relative",
};

const cardStyle = {
  background: "#ffffff",
  borderRadius: "0",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  border: "1px solid #dee2e6",
  overflow: "hidden",
  maxWidth: "700px",
  margin: "0 auto",
};

const cardHeaderStyle = {
  padding: "2.5rem 2.5rem 2rem 2.5rem",
  borderBottom: "2px solid #8b6f47",
  background: "#ffffff",
};

const titleStyle = {
  margin: "0 0 0.5rem 0",
  fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
  fontWeight: "600",
  color: "#2c3e50",
  letterSpacing: "-0.02em",
  lineHeight: "1.2",
  fontFamily: "'Georgia', 'Times New Roman', serif",
};

const descriptionStyle = {
  margin: "0",
  fontSize: "0.9375rem",
  color: "#6b7280",
  fontWeight: "400",
  letterSpacing: "-0.01em",
};

const formStyle = {
  padding: "2.5rem",
};

const fieldGroupStyle = {
  marginBottom: "1.75rem",
};

const labelStyle = {
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

const inputStyle = {
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

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
  minHeight: "120px",
  fontFamily: "inherit",
};

const buttonStyle = {
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

const successStyle = {
  padding: "2.5rem",
  textAlign: "center",
};

const successTextStyle = {
  margin: "0",
  color: "#059669",
  fontSize: "1rem",
  fontWeight: "500",
};

export default Contact;

