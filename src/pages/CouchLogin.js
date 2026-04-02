import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { connectCouchDB } from "../utils/database";

function CouchLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await connectCouchDB(username, password);
      if (result.ok) {
        navigate("/", { replace: true });
      } else {
        setError(result.error || "Could not connect.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h2 style={titleStyle}>Connect to server</h2>
          <p style={descriptionStyle}>
            Enter the CouchDB username and password for this class server. Nothing is stored in the
            downloaded app — only in this browser tab until you close it.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          {error && (
            <div style={errorBoxStyle}>
              <p style={errorTextStyle}>{error}</p>
            </div>
          )}

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              Server username <span style={requiredStyle}>*</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle}
              placeholder="CouchDB user"
              required
              autoComplete="username"
              autoFocus
              disabled={busy}
            />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              Server password <span style={requiredStyle}>*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="CouchDB password"
              required
              autoComplete="current-password"
              disabled={busy}
            />
          </div>

          <button type="submit" style={buttonStyle} disabled={busy}>
            {busy ? "Connecting…" : "Connect"}
          </button>

          <p style={hintStyle}>
            Same credentials you use for CouchDB on the server (often provided by your instructor).
          </p>
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
  minHeight: "calc(100vh - 120px)",
  background: "#f8f9fa",
};

const cardStyle = {
  background: "#ffffff",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  border: "1px solid #dee2e6",
  width: "100%",
  maxWidth: "450px",
};

const cardHeaderStyle = {
  padding: "2rem 2rem 1rem 2rem",
  borderBottom: "1px solid #f3f4f6",
};

const titleStyle = {
  margin: "0 0 0.5rem 0",
  fontSize: "1.75rem",
  fontWeight: "700",
  color: "#111827",
};

const descriptionStyle = {
  margin: "0",
  fontSize: "0.9rem",
  color: "#6b7280",
  lineHeight: 1.5,
};

const formStyle = {
  padding: "2rem",
};

const fieldGroupStyle = {
  marginBottom: "1.25rem",
};

const labelStyle = {
  display: "block",
  marginBottom: "0.5rem",
  fontWeight: "600",
  color: "#374151",
  fontSize: "0.875rem",
};

const requiredStyle = { color: "#ef4444", marginLeft: "0.25rem" };

const inputStyle = {
  width: "100%",
  padding: "0.75rem 1rem",
  border: "1.5px solid #e5e7eb",
  borderRadius: "8px",
  boxSizing: "border-box",
  fontSize: "0.9375rem",
};

const buttonStyle = {
  marginTop: "0.5rem",
  width: "100%",
  padding: "0.875rem 2rem",
  background: "#8b6f47",
  color: "#ffffff",
  border: "none",
  borderRadius: "6px",
  fontWeight: "600",
  fontSize: "1rem",
  cursor: "pointer",
};

const errorBoxStyle = {
  padding: "1rem",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  marginBottom: "1.25rem",
};

const errorTextStyle = {
  margin: "0",
  color: "#dc2626",
  fontSize: "0.9375rem",
};

const hintStyle = {
  marginTop: "1.25rem",
  fontSize: "0.8125rem",
  color: "#9ca3af",
  lineHeight: 1.4,
};

export default CouchLogin;
