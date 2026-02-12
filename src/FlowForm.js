import React, { useState } from "react";
import { localDB, checkOnlineStatus, getAuthorId } from "./utils/database";

function FlowForm() {
  const [formData, setFormData] = useState({
    depth: "",
    velocity: "",
    distanceFromBank: "",
  });

  // No GPS or timestamp needed for flow measurement form

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNumberBlur = (e) => {
    const { name, value } = e.target;
    // Format to 2 decimal places on blur
    if (name === "depth" || name === "velocity" || name === "distanceFromBank") {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && value !== "") {
        setFormData({ ...formData, [name]: numValue.toFixed(2) });
      }
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const _id = `flow_${new Date().toISOString()}`;

    try {
      // Create document with type field for CouchDB organization
      const doc = {
        _id,
        type: "flow",
        authorId: getAuthorId(),
        depth: parseFloat(formData.depth),
        velocity: parseFloat(formData.velocity),
        distanceFromBank: parseFloat(formData.distanceFromBank),
        createdAt: new Date().toISOString(),
      };

      // Save to local PouchDB first (works offline)
      await localDB.put(doc);

      // Check if online/offline
      const isOnline = checkOnlineStatus();
      if (isOnline) {
        alert("Flow measurement saved locally and will sync to CouchDB");
      } else {
        alert("Flow measurement saved locally (offline). It will sync to CouchDB when internet connection is restored.");
      }
      
      // Reset form
      setFormData({
        depth: "",
        velocity: "",
        distanceFromBank: "",
      });
    } catch (err) {
      console.error("Error saving flow data:", err);
      alert("Error saving data. Please try again.");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h2 style={titleStyle}>Flow Measurement Entry</h2>
          <p style={formDescriptionStyle}>Record water flow measurements</p>
        </div>
        
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              Depth (m) <span style={requiredStyle}>*</span>
            </label>
        <input
          type="number"
          step="0.01"
          name="depth"
          value={formData.depth}
          onChange={handleChange}
          style={inputStyle}
          placeholder="0.00"
          required
          onFocus={(e) => {
            e.target.style.borderColor = "#111827";
            e.target.style.boxShadow = "0 0 0 3px rgba(17, 24, 39, 0.1)";
          }}
          onBlur={(e) => {
            handleNumberBlur(e);
            e.target.style.borderColor = "#e5e7eb";
            e.target.style.boxShadow = "none";
          }}
        />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              Velocity (m/s) <span style={requiredStyle}>*</span>
            </label>
        <input
          type="number"
          step="0.01"
          name="velocity"
          value={formData.velocity}
          onChange={handleChange}
          style={inputStyle}
          placeholder="0.00"
          required
          onFocus={(e) => {
            e.target.style.borderColor = "#111827";
            e.target.style.boxShadow = "0 0 0 3px rgba(17, 24, 39, 0.1)";
          }}
          onBlur={(e) => {
            handleNumberBlur(e);
            e.target.style.borderColor = "#e5e7eb";
            e.target.style.boxShadow = "none";
          }}
        />
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              Distance from Bank (m) <span style={requiredStyle}>*</span>
            </label>
        <input
          type="number"
          step="0.01"
          name="distanceFromBank"
          value={formData.distanceFromBank}
          onChange={handleChange}
          style={inputStyle}
          placeholder="0.00"
          required
          onFocus={(e) => {
            e.target.style.borderColor = "#111827";
            e.target.style.boxShadow = "0 0 0 3px rgba(17, 24, 39, 0.1)";
          }}
          onBlur={(e) => {
            handleNumberBlur(e);
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
            Save Flow Data
          </button>
      </form>
      </div>
    </div>
  );
}

const containerStyle = {
  width: "100%",
  padding: "3rem 2rem",
  background: "#fafafa",
  minHeight: "calc(100vh - 200px)",
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

const formDescriptionStyle = {
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

export default FlowForm;
