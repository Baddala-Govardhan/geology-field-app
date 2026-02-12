import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { remoteDB } from "../utils/database";
import { isAdminLoggedIn, logoutAdmin } from "../utils/auth";

function rowToCSV(row) {
  return row.map((cell) => {
    const s = String(cell ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }).join(",");
}

function downloadCSV(filename, headerRow, dataRows) {
  const lines = [headerRow.join(","), ...dataRows.map((row) => rowToCSV(row))];
  const csv = lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function Admin() {
  const navigate = useNavigate();
  const [grainDocs, setGrainDocs] = useState([]);
  const [flowDocs, setFlowDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate("/login", { replace: true });
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await remoteDB.allDocs({ include_docs: true });
      const docs = (result.rows || []).map((r) => r.doc).filter(Boolean);
      setGrainDocs(docs.filter((d) => d.type === "grain"));
      setFlowDocs(docs.filter((d) => d.type === "flow"));
    } catch (err) {
      console.error(err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate("/", { replace: true });
  };

  const exportGrainCSV = () => {
    const header = [
      "id", "authorId", "grainSize", "sizeMeasurement", "quantity", "notes",
      "gps_latitude", "gps_longitude", "gps_string", "timestamp", "createdAt"
    ];
    const rows = grainDocs.map((d) => [
      d._id,
      d.authorId ?? "",
      d.grainSize ?? "",
      d.sizeMeasurement ?? "",
      d.quantity ?? "",
      d.notes ?? "",
      d.gps?.latitude ?? d.gpsLatitude ?? "",
      d.gps?.longitude ?? d.gpsLongitude ?? "",
      d.gps?.string ?? d.gpsString ?? "",
      d.timestamp ?? "",
      d.createdAt ?? "",
    ]);
    downloadCSV("grain_size_data.csv", header, rows);
  };

  const exportFlowCSV = () => {
    const header = ["id", "authorId", "depth", "velocity", "distanceFromBank", "createdAt"];
    const rows = flowDocs.map((d) => [
      d._id,
      d.authorId ?? "",
      d.depth ?? "",
      d.velocity ?? "",
      d.distanceFromBank ?? "",
      d.createdAt ?? "",
    ]);
    downloadCSV("flow_measurement_data.csv", header, rows);
  };

  if (!isAdminLoggedIn()) {
    return null;
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Admin – Raw Data</h2>
          <p style={subtitleStyle}>Instructor only. View and export student-submitted data.</p>
          <button type="button" onClick={handleLogout} style={logoutBtnStyle}>
            Log out
          </button>
        </div>

        {loading && <p style={pStyle}>Loading data…</p>}
        {error && <p style={errorStyle}>{error}</p>}

        {!loading && !error && (
          <>
            <section style={sectionStyle}>
              <h3 style={h3Style}>Grain Size ({grainDocs.length})</h3>
              <button type="button" onClick={exportGrainCSV} style={exportBtnStyle} disabled={grainDocs.length === 0}>
                Export Grain Size to CSV
              </button>
              <div style={tableWrapStyle}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>ID</th>
                      <th style={thStyle}>Author ID</th>
                      <th style={thStyle}>Grain Size</th>
                      <th style={thStyle}>Size (mm)</th>
                      <th style={thStyle}>Quantity</th>
                      <th style={thStyle}>Notes</th>
                      <th style={thStyle}>GPS</th>
                      <th style={thStyle}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grainDocs.map((d) => (
                      <tr key={d._id}>
                        <td style={tdStyle}>{d._id}</td>
                        <td style={tdStyle}>{d.authorId ?? "—"}</td>
                        <td style={tdStyle}>{d.grainSize ?? "—"}</td>
                        <td style={tdStyle}>{d.sizeMeasurement ?? "—"}</td>
                        <td style={tdStyle}>{d.quantity ?? "—"}</td>
                        <td style={tdStyle}>{(d.notes || "").slice(0, 40)}{(d.notes && d.notes.length > 40) ? "…" : ""}</td>
                        <td style={tdStyle}>{d.gps?.string ?? d.gpsString ?? "—"}</td>
                        <td style={tdStyle}>{d.createdAt ? new Date(d.createdAt).toLocaleString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {grainDocs.length === 0 && <p style={pStyle}>No grain size entries yet.</p>}
              </div>
            </section>

            <section style={sectionStyle}>
              <h3 style={h3Style}>Flow Measurement ({flowDocs.length})</h3>
              <button type="button" onClick={exportFlowCSV} style={exportBtnStyle} disabled={flowDocs.length === 0}>
                Export Flow Measurement to CSV
              </button>
              <div style={tableWrapStyle}>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>ID</th>
                      <th style={thStyle}>Author ID</th>
                      <th style={thStyle}>Depth (m)</th>
                      <th style={thStyle}>Velocity</th>
                      <th style={thStyle}>Distance from bank</th>
                      <th style={thStyle}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flowDocs.map((d) => (
                      <tr key={d._id}>
                        <td style={tdStyle}>{d._id}</td>
                        <td style={tdStyle}>{d.authorId ?? "—"}</td>
                        <td style={tdStyle}>{d.depth ?? "—"}</td>
                        <td style={tdStyle}>{d.velocity ?? "—"}</td>
                        <td style={tdStyle}>{d.distanceFromBank ?? "—"}</td>
                        <td style={tdStyle}>{d.createdAt ? new Date(d.createdAt).toLocaleString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {flowDocs.length === 0 && <p style={pStyle}>No flow measurement entries yet.</p>}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

const containerStyle = {
  padding: "2rem",
  maxWidth: "1200px",
  margin: "0 auto",
};

const cardStyle = {
  background: "#fff",
  border: "1px solid #dee2e6",
  borderRadius: "8px",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const headerStyle = {
  padding: "1.5rem 2rem",
  borderBottom: "2px solid #8b6f47",
  background: "#fafafa",
  position: "relative",
};

const titleStyle = { margin: "0 0 0.25rem 0", fontSize: "1.5rem", color: "#2c3e50" };
const subtitleStyle = { margin: "0", fontSize: "0.9rem", color: "#6c757d" };

const logoutBtnStyle = {
  position: "absolute",
  top: "1rem",
  right: "1rem",
  padding: "0.5rem 1rem",
  background: "#6c757d",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "0.875rem",
};

const sectionStyle = { padding: "1.5rem 2rem", borderTop: "1px solid #eee" };
const h3Style = { margin: "0 0 0.75rem 0", fontSize: "1.15rem", color: "#2c3e50" };
const exportBtnStyle = {
  marginBottom: "1rem",
  padding: "0.5rem 1rem",
  background: "#8b6f47",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "0.875rem",
};
const tableWrapStyle = { overflowX: "auto" };
const tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" };
const thStyle = { textAlign: "left", padding: "0.5rem", borderBottom: "2px solid #dee2e6", background: "#f8f9fa" };
const tdStyle = { padding: "0.5rem", borderBottom: "1px solid #eee" };
const pStyle = { margin: "0.5rem 0", color: "#6c757d" };
const errorStyle = { color: "#dc3545", margin: "0.5rem 0" };

export default Admin;
