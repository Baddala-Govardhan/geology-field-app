import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { localDB, getAuthorId, getStudentId } from "../utils/database";

function MyData() {
  const [grainDocs, setGrainDocs] = useState([]);
  const [flowDocs, setFlowDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMyData();
  }, []);

  const loadMyData = async () => {
    setLoading(true);
    setError(null);
    const authorId = getAuthorId();
    try {
      const result = await localDB.allDocs({ include_docs: true });
      const docs = (result.rows || []).map((r) => r.doc).filter(Boolean);
      const mine = docs.filter((d) => d.authorId === authorId);
      setGrainDocs(mine.filter((d) => d.type === "grain"));
      setFlowDocs(mine.filter((d) => d.type === "flow"));
    } catch (err) {
      console.error(err);
      setError("Failed to load your data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={containerStyle}><p style={pStyle}>Loading your data…</p></div>;
  if (error) return <div style={containerStyle}><p style={errorStyle}>{error}</p></div>;

  const hasStudentId = !!getStudentId();

  return (
    <div style={containerStyle}>
      {!hasStudentId && (
        <div style={bannerStyle}>
          Set your <Link to="/student-id" style={bannerLinkStyle}>Student ID</Link> so your data syncs across devices (phone, laptop). Use the same ID on each device.
        </div>
      )}
      <div style={cardStyle}>
        <h2 style={titleStyle}>My Data</h2>
        <p style={subtitleStyle}>
          {hasStudentId ? "Only your submitted entries are shown here." : "Only your submitted entries are shown here. Set a Student ID to see the same data on all your devices."}
        </p>

        <section style={sectionStyle}>
          <h3 style={h3Style}>Grain Size ({grainDocs.length})</h3>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Grain Size</th>
                  <th style={thStyle}>Size (mm)</th>
                  <th style={thStyle}>Quantity</th>
                  <th style={thStyle}>Notes</th>
                  <th style={thStyle}>GPS</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {grainDocs.map((d) => (
                  <tr key={d._id}>
                    <td style={tdStyle}>{d.grainSize ?? "—"}</td>
                    <td style={tdStyle}>{d.sizeMeasurement ?? "—"}</td>
                    <td style={tdStyle}>{d.quantity ?? "—"}</td>
                    <td style={tdStyle}>{(d.notes || "").slice(0, 30)}{(d.notes && d.notes.length > 30) ? "…" : ""}</td>
                    <td style={tdStyle}>{d.gps?.string ?? d.gpsString ?? "—"}</td>
                    <td style={tdStyle}>{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {grainDocs.length === 0 && <p style={pStyle}>No grain size entries yet.</p>}
          </div>
        </section>

        <section style={sectionStyle}>
          <h3 style={h3Style}>Flow Measurement ({flowDocs.length})</h3>
          <div style={tableWrapStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Depth (m)</th>
                  <th style={thStyle}>Velocity</th>
                  <th style={thStyle}>Distance from bank</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {flowDocs.map((d) => (
                  <tr key={d._id}>
                    <td style={tdStyle}>{d.depth ?? "—"}</td>
                    <td style={tdStyle}>{d.velocity ?? "—"}</td>
                    <td style={tdStyle}>{d.distanceFromBank ?? "—"}</td>
                    <td style={tdStyle}>{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {flowDocs.length === 0 && <p style={pStyle}>No flow measurement entries yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

const containerStyle = { padding: "2rem", maxWidth: "1000px", margin: "0 auto" };
const cardStyle = { background: "#fff", border: "1px solid #dee2e6", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" };
const titleStyle = { margin: "0 0 0.25rem 0", fontSize: "1.5rem", color: "#2c3e50", padding: "1rem 1.5rem 0" };
const subtitleStyle = { margin: "0 0 1rem 0", fontSize: "0.9rem", color: "#6c757d", padding: "0 1.5rem" };
const sectionStyle = { padding: "1rem 1.5rem", borderTop: "1px solid #eee" };
const h3Style = { margin: "0 0 0.5rem 0", fontSize: "1.1rem", color: "#2c3e50" };
const tableWrapStyle = { overflowX: "auto" };
const tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" };
const thStyle = { textAlign: "left", padding: "0.5rem", borderBottom: "2px solid #dee2e6", background: "#f8f9fa" };
const tdStyle = { padding: "0.5rem", borderBottom: "1px solid #eee" };
const pStyle = { margin: "0.5rem 0", color: "#6c757d" };
const errorStyle = { color: "#dc3545", margin: "0.5rem 0" };
const bannerStyle = {
  background: "#fef3c7",
  border: "1px solid #f59e0b",
  borderRadius: "8px",
  padding: "0.75rem 1rem",
  marginBottom: "1rem",
  fontSize: "0.9rem",
  color: "#92400e",
};
const bannerLinkStyle = { color: "#b45309", fontWeight: 600, textDecoration: "none" };

export default MyData;
