import React, { useState, useEffect } from "react";
import { getGPSLocation, formatGPSString } from "./utils/gps";
import { localDB, checkOnlineStatus, getAuthorId } from "./utils/database";

function GrainForm() {
  const [formData, setFormData] = useState({
    grainSize: "",
    sizeMeasurement: "",
    quantity: "",
    notes: "",
    gpsLatitude: "",
    gpsLongitude: "",
    gpsString: "",
    timestamp: "",
  });

  const [gpsError, setGpsError] = useState(null);
  const [manualGPSEntry, setManualGPSEntry] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [lastGPSLocation, setLastGPSLocation] = useState(null);

  // Grain size options - standard geological classifications
  const grainSizeOptions = [
    "Very Fine",
    "Fine", 
    "Medium",
    "Coarse",
    "Very Coarse",
    "Granule",
    "Pebble",
    "Cobble",
    "Boulder"
  ];

  useEffect(() => {
    // Get GPS location automatically
    setGpsLoading(true);
    getGPSLocation().then((gpsData) => {
      setGpsLoading(false);
      if (gpsData.error) {
        setGpsError(gpsData.error);
        setManualGPSEntry(gpsData.manualEntry);
      } else {
        // Check if coordinates are the same as last time (might be cached/default)
        const currentCoords = `${gpsData.latitude},${gpsData.longitude}`;
        if (lastGPSLocation && lastGPSLocation === currentCoords) {
          console.warn("Same coordinates detected - may be cached/default location");
          setGpsError("Warning: Same coordinates detected. This may be a cached location. Please use 'Refresh GPS' or enter coordinates manually.");
        } else {
          setGpsError(null);
        }
        
        setLastGPSLocation(currentCoords);
        setFormData((prev) => ({
          ...prev,
          gpsLatitude: gpsData.latitude,
          gpsLongitude: gpsData.longitude,
          gpsString: formatGPSString(gpsData.latitude, gpsData.longitude),
        }));
        setManualGPSEntry(false);
      }
    });

    // Set timestamp
    const now = new Date().toISOString();
    setFormData((prev) => ({ ...prev, timestamp: now }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNumberBlur = (e) => {
    const { name, value } = e.target;
    // Format to 2 decimal places on blur for sizeMeasurement, whole number for quantity
    if (name === "sizeMeasurement") {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && value !== "") {
        setFormData({ ...formData, [name]: numValue.toFixed(2) });
      }
    } else if (name === "quantity") {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && value !== "") {
        setFormData({ ...formData, [name]: Math.round(numValue).toString() });
      }
    }
  };

  const handleManualGPSChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Update GPS string when coordinates change
      if (name === "gpsLatitude" || name === "gpsLongitude") {
        updated.gpsString = formatGPSString(
          name === "gpsLatitude" ? parseFloat(value) : prev.gpsLatitude,
          name === "gpsLongitude" ? parseFloat(value) : prev.gpsLongitude
        );
      }
      return updated;
    });
  };

  const handleRetryGPS = () => {
    setGpsError(null);
    setManualGPSEntry(false);
    setGpsLoading(true);
    setLastGPSLocation(null); // Clear last location to force fresh check
    // Clear any cached coordinates first
    setFormData((prev) => ({
      ...prev,
      gpsLatitude: "",
      gpsLongitude: "",
      gpsString: "Getting location...",
    }));
    
    getGPSLocation().then((gpsData) => {
      setGpsLoading(false);
      if (gpsData.error) {
        setGpsError(gpsData.error);
        setManualGPSEntry(gpsData.manualEntry);
      } else {
        // Check if coordinates are the same as last time (might be cached/default)
        const currentCoords = `${gpsData.latitude},${gpsData.longitude}`;
        if (lastGPSLocation && lastGPSLocation === currentCoords) {
          console.warn("Same coordinates detected - may be cached/default location");
          setGpsError("Warning: Same coordinates detected. This may be a cached location. Please enter coordinates manually or try on a mobile device with GPS.");
        } else {
          setGpsError(null);
        }
        
        setLastGPSLocation(currentCoords);
        setFormData((prev) => ({
          ...prev,
          gpsLatitude: gpsData.latitude,
          gpsLongitude: gpsData.longitude,
          gpsString: formatGPSString(gpsData.latitude, gpsData.longitude),
        }));
        setManualGPSEntry(false);
      }
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate GPS if manual entry
    if (manualGPSEntry && (!formData.gpsLatitude || !formData.gpsLongitude)) {
      alert("Please enter GPS coordinates or allow location access");
      return;
    }

    const _id = `grain_${new Date().toISOString()}`;

    try {
      // Create document with type field for CouchDB organization
      const doc = {
        _id,
        type: "grain",
        authorId: getAuthorId(),
        grainSize: formData.grainSize,
        sizeMeasurement: formData.sizeMeasurement ? parseFloat(formData.sizeMeasurement) : null,
        quantity: formData.quantity ? parseFloat(formData.quantity) : null,
        notes: formData.notes || "",
        gps: {
          latitude: parseFloat(formData.gpsLatitude),
          longitude: parseFloat(formData.gpsLongitude),
          string: formData.gpsString,
        },
        timestamp: formData.timestamp,
        createdAt: new Date().toISOString(),
      };

      // Save to local PouchDB first (works offline)
      await localDB.put(doc);

      // Check if online/offline
      const isOnline = checkOnlineStatus();
      if (isOnline) {
        alert("Grain size data saved locally and will sync to CouchDB");
      } else {
        alert("Grain size data saved locally (offline). It will sync to CouchDB when internet connection is restored.");
      }
      
      // Reset form but keep GPS and update timestamp
      const now = new Date().toISOString();
      setFormData({
        grainSize: "",
        sizeMeasurement: "",
        quantity: "",
        notes: "",
        gpsLatitude: formData.gpsLatitude,
        gpsLongitude: formData.gpsLongitude,
        gpsString: formData.gpsString,
        timestamp: now,
      });
    } catch (err) {
      console.error("Error saving to PouchDB", err);
      alert("Error saving data. Please try again.");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={cardHeaderStyle}>
          <h2 style={titleStyle}>Grain Size Entry</h2>
          <p style={formDescriptionStyle}>Record grain size measurements with location data</p>
        </div>
        
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              Grain Size <span style={requiredStyle}>*</span>
            </label>
            <select
              name="grainSize"
              value={formData.grainSize}
              onChange={handleChange}
              style={selectStyle}
              required
              onFocus={(e) => {
                e.target.style.borderColor = "#8b6f47";
                e.target.style.boxShadow = "0 0 0 3px rgba(139, 111, 71, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.boxShadow = "none";
              }}
            >
              <option value="">Select grain size</option>
              {grainSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>
              Size Measurement (mm)
            </label>
            <input
              type="number"
              step="0.01"
              name="sizeMeasurement"
              value={formData.sizeMeasurement}
              onChange={handleChange}
              style={inputStyle}
              placeholder="e.g., 2.5"
              onFocus={(e) => {
                e.target.style.borderColor = "#8b6f47";
                e.target.style.boxShadow = "0 0 0 3px rgba(139, 111, 71, 0.1)";
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
              Quantity/Count
            </label>
            <input
              type="number"
              step="1"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              style={inputStyle}
              placeholder="e.g., 10"
              onFocus={(e) => {
                e.target.style.borderColor = "#8b6f47";
                e.target.style.boxShadow = "0 0 0 3px rgba(139, 111, 71, 0.1)";
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
              Notes/Observations
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              style={textareaStyle}
              placeholder="Enter any additional observations or notes..."
              rows="4"
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
              GPS Coordinates <span style={requiredStyle}>*</span>
            </label>
            <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.8125rem", color: "#6b7280", fontStyle: "italic" }}>
              📍 For accurate GPS: Allow location permission when prompted. Use HTTPS or mobile device for best results.
            </p>
            {gpsError && (
              <div style={errorStyle}>
                <div style={errorHeaderStyle}>
                  <p style={{ margin: "0 0 0.5rem 0", color: "#dc2626", fontWeight: "600", fontSize: "0.9375rem" }}>
                    {gpsError}
                  </p>
                </div>
                {manualGPSEntry && (
                  <div style={manualGPSContainerStyle}>
                    <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.9375rem", color: "#666666" }}>
                      Please enter coordinates manually:
                    </p>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ ...labelStyle, marginTop: "0", fontSize: "0.875rem", color: "#666666", textTransform: "none" }}>
                          Latitude
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          name="gpsLatitude"
                          value={formData.gpsLatitude}
                          onChange={handleManualGPSChange}
                          placeholder="e.g., 40.7128"
                          style={inputStyle}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ ...labelStyle, marginTop: "0", fontSize: "0.875rem", color: "#666666", textTransform: "none" }}>
                          Longitude
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          name="gpsLongitude"
                          value={formData.gpsLongitude}
                          onChange={handleManualGPSChange}
                          placeholder="e.g., -74.0060"
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRetryGPS}
                  style={retryButtonStyle}
                >
                  Retry GPS
                </button>
              </div>
            )}
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <input
                value={gpsLoading ? "Getting location..." : (formData.gpsString || "No location available")}
                readOnly
                style={readOnlyInputStyle}
              />
              <button
                type="button"
                onClick={handleRetryGPS}
                style={{
                  ...retryButtonStyle,
                  padding: "0.75rem 1.25rem",
                  whiteSpace: "nowrap",
                  marginTop: "0",
                }}
                disabled={gpsLoading}
                onMouseEnter={(e) => {
                  if (!gpsLoading) {
                    e.target.style.background = "#e0e2e5";
                    e.target.style.borderColor = "#8b6f47";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!gpsLoading) {
                    e.target.style.background = "#f0f2f5";
                    e.target.style.borderColor = "#d1d5db";
                  }
                }}
              >
                {gpsLoading ? "Loading..." : "Refresh GPS"}
              </button>
            </div>
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>Timestamp</label>
            <input
              value={formData.timestamp ? new Date(formData.timestamp).toLocaleString() : ""}
              readOnly
              style={readOnlyInputStyle}
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
            Save Grain Size Data
          </button>
      </form>
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

const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 1rem center",
  paddingRight: "2.5rem",
  background: "#ffffff",
};

const textareaStyle = {
  ...inputStyle,
  resize: "vertical",
  minHeight: "100px",
  fontFamily: "inherit",
};

const readOnlyInputStyle = {
  ...inputStyle,
  background: "#f9fafb",
  color: "#6b7280",
  cursor: "not-allowed",
  borderColor: "#e5e7eb",
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

const errorHeaderStyle = {
  marginBottom: "0.75rem",
};

const manualGPSContainerStyle = {
  marginTop: "1rem",
  paddingTop: "1rem",
  borderTop: "1px solid #fecaca",
};

const retryButtonStyle = {
  marginTop: "0.75rem",
  padding: "0.625rem 1.25rem",
  background: "#ffffff",
  color: "#374151",
  border: "1.5px solid #e5e7eb",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "0.875rem",
  fontWeight: "600",
  transition: "all 0.2s ease",
  letterSpacing: "-0.01em",
};

export default GrainForm;
