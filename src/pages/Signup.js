import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // For demo purposes, save user data
    // In production, this would create an account via backend
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userEmail", formData.email);
    localStorage.setItem("userName", formData.name);
    
    // Redirect to home or dashboard
    navigate("/grain");
  };

  return (
    <div style={containerStyle}>
      <div style={backgroundPatternStyle}></div>
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h2 style={titleStyle}>Create Account</h2>
          <p style={descriptionStyle}>Start collecting field data today</p>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          {error && (
            <div style={errorStyle}>
              <p style={errorTextStyle}>{error}</p>
            </div>
          )}

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              Full Name <span style={requiredStyle}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={inputStyle}
              placeholder="John Doe"
              required
              onFocus={(e) => {
                e.target.style.borderColor = "#111827";
                e.target.style.boxShadow = "0 0 0 3px rgba(17, 24, 39, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              Email Address <span style={requiredStyle}>*</span>
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
                e.target.style.borderColor = "#111827";
                e.target.style.boxShadow = "0 0 0 3px rgba(17, 24, 39, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              Password <span style={requiredStyle}>*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle}
              placeholder="At least 6 characters"
              required
              onFocus={(e) => {
                e.target.style.borderColor = "#111827";
                e.target.style.boxShadow = "0 0 0 3px rgba(17, 24, 39, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              Confirm Password <span style={requiredStyle}>*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Re-enter your password"
              required
              onFocus={(e) => {
                e.target.style.borderColor = "#111827";
                e.target.style.boxShadow = "0 0 0 3px rgba(17, 24, 39, 0.1)";
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
              e.target.style.background = "#1f2937";
              e.target.style.transform = "translateY(-1px)";
              e.target.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "#111827";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.05)";
            }}
          >
            Create Account
          </button>

          <div style={footerTextStyle}>
            <p style={footerParagraphStyle}>
              Already have an account?{" "}
              <Link to="/login" style={linkStyle}>
                Sign in
              </Link>
            </p>
            <Link to="/" style={backLinkStyle}>
              ← Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

const containerStyle = {
  width: "100%",
  padding: "4rem 2rem",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "calc(100vh - 200px)",
  background: "#f8f9fa",
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23d4a574' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`,
  position: "relative",
};

const backgroundPatternStyle = {
  display: "none",
};

const cardStyle = {
  background: "#ffffff",
  borderRadius: "0",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  border: "1px solid #dee2e6",
  overflow: "hidden",
  width: "100%",
  maxWidth: "450px",
  animation: "fadeInUp 0.6s ease-out",
  position: "relative",
  zIndex: 1,
};

const cardHeaderStyle = {
  padding: "2.5rem 2.5rem 2rem 2.5rem",
  borderBottom: "1px solid #f3f4f6",
  background: "linear-gradient(to bottom, #ffffff, #fafafa)",
};

const titleStyle = {
  margin: "0 0 0.5rem 0",
  fontSize: "clamp(2rem, 4vw, 2.5rem)",
  fontWeight: "700",
  color: "#111827",
  letterSpacing: "-0.03em",
  lineHeight: "1.2",
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

const errorStyle = {
  padding: "1rem",
  background: "#fef2f2",
  border: "1.5px solid #fecaca",
  borderRadius: "8px",
  marginBottom: "1.5rem",
};

const errorTextStyle = {
  margin: "0",
  color: "#dc2626",
  fontWeight: "600",
  fontSize: "0.9375rem",
};

const footerTextStyle = {
  marginTop: "2rem",
  textAlign: "center",
};

const footerParagraphStyle = {
  margin: "0 0 1rem 0",
  color: "#666666",
  fontSize: "0.9375rem",
};

const linkStyle = {
  color: "#000000",
  textDecoration: "none",
  fontWeight: "600",
  transition: "all 0.2s ease",
};

const backLinkStyle = {
  color: "#666666",
  textDecoration: "none",
  fontSize: "0.875rem",
  transition: "all 0.3s ease",
};

export default Signup;

