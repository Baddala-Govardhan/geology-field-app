import React, { useState, useEffect } from "react";
import { getStudentId, setStudentId, startSync, localDB, STUDENT_ID_CONFIG } from "../utils/database";

function StudentId() {
  const [oldId, setOldId] = useState("");
  const [newIdWithMigration, setNewIdWithMigration] = useState("");
  const [newIdOnly, setNewIdOnly] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    const current = getStudentId();
    setOldId(current || "");
  }, []);

  const handleChangeAndKeepData = async (e) => {
    e.preventDefault();
    setMessage("");
    setSuccess("");
    const oldTrim = oldId.trim();
    const newTrim = newIdWithMigration.trim();
    if (!oldTrim || !newTrim) {
      setMessage("Enter both Old ID and New ID.");
      return;
    }
    if (oldTrim !== getStudentId()) {
      setMessage("Old ID does not match your current Student ID.");
      return;
    }
    if (oldTrim === newTrim) {
      setMessage("New ID must be different from Old ID.");
      return;
    }
    setMigrating(true);
    try {
      const result = await localDB.allDocs({ include_docs: true });
      const rows = result.rows || [];
      let updated = 0;
      for (const row of rows) {
        const doc = row.doc;
        if (doc && doc.authorId === oldTrim) {
          const updatedDoc = { ...doc, authorId: newTrim };
          await localDB.put(updatedDoc);
          updated++;
        }
      }
      setStudentId(newTrim);
      startSync();
      setSuccess(`Student ID changed. ${updated} record(s) moved to your new ID.`);
      setNewIdWithMigration("");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error(err);
      setMessage("Failed to update. Please try again.");
    } finally {
      setMigrating(false);
    }
  };

  const handleNewIdOnly = (e) => {
    e.preventDefault();
    setMessage("");
    setSuccess("");
    const newTrim = newIdOnly.trim();
    if (!newTrim) {
      setMessage("Enter a New ID.");
      return;
    }
    setStudentId(newTrim);
    startSync();
    setSuccess("Student ID saved. You will not see data from your old ID.");
    setNewIdOnly("");
    setTimeout(() => setSuccess(""), 4000);
  };

  const currentId = getStudentId();
  const alreadySet = !!currentId;

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Student ID</h2>

        {alreadySet ? (
          <>
            <div style={alreadySetBoxStyle}>
              <p style={alreadySetTitleStyle}>Student ID already set.</p>
              <p style={alreadySetTextStyle}>Your data will sync on all devices where you use this ID.</p>
              <p style={currentIdStyle}>Current ID: <strong>{currentId}</strong></p>
            </div>

            <p style={sectionLabelStyle}>Change ID and keep my data</p>
            <p style={subtitleStyle}>Enter your current (old) ID and the new ID. Your existing entries will be moved to the new ID.</p>
            <form onSubmit={handleChangeAndKeepData} style={formStyle}>
              <label style={labelStyle}>Old ID (current)</label>
              <input
                type="text"
                value={oldId}
                onChange={(e) => setOldId(e.target.value)}
                placeholder="Current Student ID"
                style={inputStyle}
                maxLength={STUDENT_ID_CONFIG.maxLength}
              />
              <label style={labelStyle}>New ID</label>
              <input
                type="text"
                value={newIdWithMigration}
                onChange={(e) => setNewIdWithMigration(e.target.value)}
                placeholder={`e.g. ${STUDENT_ID_CONFIG.placeholderNewExample}`}
                style={inputStyle}
                maxLength={STUDENT_ID_CONFIG.maxLength}
              />
              <button type="submit" style={buttonStyle} disabled={migrating}>
                {migrating ? "Updating…" : "Save and move my data to new ID"}
              </button>
            </form>

            <p style={sectionLabelStyle}>Use new ID only (don’t keep old data)</p>
            <p style={subtitleStyle}>If you don’t need data from your old ID, enter only the new ID and save.</p>
            <form onSubmit={handleNewIdOnly} style={formStyle}>
              <label style={labelStyle}>New ID</label>
              <input
                type="text"
                value={newIdOnly}
                onChange={(e) => setNewIdOnly(e.target.value)}
                placeholder={`e.g. ${STUDENT_ID_CONFIG.placeholderNewExample}`}
                style={inputStyle}
                maxLength={STUDENT_ID_CONFIG.maxLength}
              />
              <button type="submit" style={buttonSecondaryStyle}>Save new ID only</button>
            </form>

            {message && <p style={messageStyle}>{message}</p>}
            {success && <p style={successStyle}>{success}</p>}
          </>
        ) : (
          <p style={noIdStyle}>You don’t have a Student ID set yet. Set it when you use Grain Size or Flow Measurement.</p>
        )}
      </div>
    </div>
  );
}

const containerStyle = { padding: "2rem", maxWidth: "500px", margin: "0 auto" };
const cardStyle = {
  background: "#fff",
  border: "1px solid #dee2e6",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  padding: "1.5rem 2rem",
};
const titleStyle = { margin: "0 0 0.5rem 0", fontSize: "1.5rem", color: "#2c3e50" };
const subtitleStyle = { margin: "0 0 1.25rem 0", fontSize: "0.9rem", color: "#6c757d", lineHeight: 1.4 };
const formStyle = { marginBottom: "1rem" };
const labelStyle = { display: "block", marginBottom: "0.5rem", fontWeight: 600, color: "#374151", fontSize: "0.875rem" };
const inputStyle = {
  width: "100%",
  padding: "0.6rem 0.75rem",
  border: "1.5px solid #e5e7eb",
  borderRadius: "6px",
  fontSize: "1rem",
  boxSizing: "border-box",
};
const buttonStyle = {
  marginTop: "0.75rem",
  padding: "0.6rem 1.25rem",
  background: "#8b6f47",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontWeight: 600,
  fontSize: "0.9rem",
  cursor: "pointer",
};
const buttonSecondaryStyle = {
  marginTop: "0.75rem",
  padding: "0.5rem 1rem",
  background: "transparent",
  color: "#6c757d",
  border: "1px solid #dee2e6",
  borderRadius: "6px",
  fontSize: "0.875rem",
  cursor: "pointer",
};
const sectionLabelStyle = { margin: "1.5rem 0 0.25rem 0", fontWeight: 600, color: "#2c3e50", fontSize: "0.95rem" };
const messageStyle = { margin: "0 0 0.5rem 0", fontSize: "0.9rem", color: "#6c757d" };
const successStyle = { margin: "0 0 0.5rem 0", fontSize: "0.9rem", color: "#0f766e", fontWeight: 600 };
const alreadySetBoxStyle = {
  background: "#ecfdf5",
  border: "1px solid #a7f3d0",
  borderRadius: "8px",
  padding: "1rem 1.25rem",
  marginBottom: "1rem",
};
const alreadySetTitleStyle = { margin: "0 0 0.25rem 0", fontWeight: 600, color: "#065f46" };
const alreadySetTextStyle = { margin: "0", fontSize: "0.9rem", color: "#047857" };
const currentIdStyle = { margin: "0.5rem 0 0 0", fontSize: "0.9rem", color: "#374151" };
const noIdStyle = { margin: "0", fontSize: "0.95rem", color: "#6c757d" };

export default StudentId;
