import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { rebuildRemoteDB, verifyCouchDbAccess } from "../utils/database";

/** Fauxton root; it routes to the login screen when there is no session (any CouchDB version). */
function fauxtonLoginSrc() {
  const { protocol, hostname, port } = window.location;
  const p = port ? `:${port}` : "";
  return `${protocol}//${hostname}${p}/couchdb/_utils/`;
}

function CouchLogin() {
  const navigate = useNavigate();
  const [hint, setHint] = useState("");

  const handleContinue = async () => {
    setHint("");
    rebuildRemoteDB();
    const ok = await verifyCouchDbAccess();
    if (ok) {
      navigate("/", { replace: true });
    } else {
      setHint("Use Log In below first, then try again.");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={barStyle}>
        <p style={barTextStyle}>
          This is the same CouchDB Fauxton screen as on your machine (
          <code style={codeStyle}>127.0.0.1:5984/_utils</code>
          ). After you log in, open the field app.
        </p>
        <button type="button" onClick={handleContinue} style={primaryBtnStyle}>
          Continue to Geology Field Data
        </button>
        {hint ? <p style={hintStyle}>{hint}</p> : null}
      </div>
      <iframe title="CouchDB Fauxton login" src={fauxtonLoginSrc()} style={iframeStyle} />
    </div>
  );
}

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  margin: 0,
  background: "#1a1a1a",
};

const barStyle = {
  flexShrink: 0,
  padding: "0.75rem 1rem",
  background: "#f8f9fa",
  borderBottom: "1px solid #dee2e6",
  textAlign: "center",
};

const barTextStyle = {
  margin: "0 0 0.5rem 0",
  fontSize: "0.875rem",
  color: "#374151",
  lineHeight: 1.45,
};

const codeStyle = {
  fontSize: "0.8em",
  background: "#e5e7eb",
  padding: "0.1em 0.35em",
  borderRadius: "4px",
};

const primaryBtnStyle = {
  padding: "0.5rem 1.25rem",
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#fff",
  background: "#8b6f47",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const hintStyle = {
  margin: "0.5rem 0 0 0",
  fontSize: "0.8125rem",
  color: "#b45309",
};

const iframeStyle = {
  flex: 1,
  width: "100%",
  border: "none",
  background: "#fff",
};

export default CouchLogin;
