// import React, { useState } from "react";
// import PouchDB from "pouchdb";

// const db = new PouchDB("geology_field_data");
// const remoteDB = new PouchDB("http://app:app@localhost:5984/geology-data");

// db.sync(remoteDB, {
//   live: true,
//   retry: true,
// })
//   .on("change", (info) => console.log("Sync change:", info))
//   .on("paused", () => console.log("Sync paused"))
//   .on("active", () => console.log("Sync active"))
//   .on("error", (err) => console.error("Sync error:", err));

// function App() {
//   const [formData, setFormData] = useState({
//     grainSize: "",
//     sedimentType: "",
//     gpsLocation: "",
//     notes: "",
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const doc = {
//       _id: new Date().toISOString(),
//       ...formData,
//     };

//     try {
//       await db.put(doc);
//       alert("Data saved locally");
//       setFormData({ grainSize: "", sedimentType: "", gpsLocation: "", notes: "" });
//     } catch (err) {
//       console.error("Error saving to PouchDB", err);
//     }
//   };

//   return (
//     <div style={containerStyle}>
//       <h2 style={titleStyle}>Geology Field Data Entry</h2>
//       <form onSubmit={handleSubmit}>
//         <label style={labelStyle}>Grain Size</label>
//         <input
//           name="grainSize"
//           value={formData.grainSize}
//           onChange={handleChange}
//           placeholder="e.g., fine, medium"
//           style={inputStyle}
//         />

//         <label style={labelStyle}>Sediment Type</label>
//         <input
//           name="sedimentType"
//           value={formData.sedimentType}
//           onChange={handleChange}
//           placeholder="e.g., sandstone"
//           style={inputStyle}
//         />

//         <label style={labelStyle}>GPS Location</label>
//         <input
//           name="gpsLocation"
//           value={formData.gpsLocation}
//           onChange={handleChange}
//           placeholder="latitude, longitude"
//           style={inputStyle}
//         />

//         <label style={labelStyle}>Notes</label>
//         <textarea
//           name="notes"
//           value={formData.notes}
//           onChange={handleChange}
//           placeholder="Additional observations"
//           style={{ ...inputStyle, height: "100px" }}
//         />

//         <button type="submit" style={buttonStyle}>
//           Save
//         </button>
//       </form>
//     </div>
//   );
// }

// const containerStyle = {
//   maxWidth: "500px",
//   margin: "40px auto",
//   padding: "20px",
//   border: "1px solid #ddd",
//   borderRadius: "8px",
//   backgroundColor: "#f9f9f9",
//   fontFamily: "Arial, sans-serif",
// };

// const titleStyle = {
//   textAlign: "center",
//   color: "#2c3e50",
// };

// const labelStyle = {
//   display: "block",
//   marginTop: "15px",
//   marginBottom: "5px",
//   fontWeight: "bold",
//   color: "#34495e",
// };

// const inputStyle = {
//   width: "100%",
//   padding: "10px",
//   border: "1px solid #ccc",
//   borderRadius: "4px",
//   boxSizing: "border-box",
// };

// const buttonStyle = {
//   marginTop: "20px",
//   width: "100%",
//   padding: "12px",
//   backgroundColor: "#3498db",
//   color: "white",
//   border: "none",
//   borderRadius: "4px",
//   fontWeight: "bold",
//   cursor: "pointer",
// };

// export default App;




import React, { useState } from "react";
import PouchDB from "pouchdb";

const db = new PouchDB("geology_field_data");
const remoteDB = new PouchDB("http://app:app@localhost:5984/geology-data");

db.sync(remoteDB, {
  live: true,
  retry: true,
})
  .on("change", (info) => console.log("Sync change:", info))
  .on("paused", () => console.log("Sync paused"))
  .on("active", () => console.log("Sync active"))
  .on("error", (err) => console.error("Sync error:", err));

function App() {
  const [formData, setFormData] = useState({
    grainSize: "",
    sedimentType: "",
    gpsLocation: "",
    notes: "",
  });

  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const _id = new Date().toISOString();

    try {
      const doc = {
        _id,
        ...formData,
      };

      await db.put(doc);

      if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const result = reader.result;
          const contentType = file.type || "application/octet-stream";

          await db.putAttachment(_id, file.name, doc._rev, result, contentType);
        };
        reader.readAsArrayBuffer(file);
      }

      alert("Data saved locally");
      setFormData({ grainSize: "", sedimentType: "", gpsLocation: "", notes: "" });
      setFile(null);
    } catch (err) {
      console.error("Error saving to PouchDB", err);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Geology Field Data Entry</h2>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Grain Size</label>
        <input name="grainSize" value={formData.grainSize} onChange={handleChange} style={inputStyle} />

        <label style={labelStyle}>Sediment Type</label>
        <input name="sedimentType" value={formData.sedimentType} onChange={handleChange} style={inputStyle} />

        <label style={labelStyle}>GPS Location</label>
        <input name="gpsLocation" value={formData.gpsLocation} onChange={handleChange} style={inputStyle} />

        <label style={labelStyle}>Notes</label>
        <textarea name="notes" value={formData.notes} onChange={handleChange} style={{ ...inputStyle, height: "80px" }} />

        <label style={labelStyle}>Upload File</label>
        <input type="file" onChange={handleFileChange} style={inputStyle} />

        <button type="submit" style={buttonStyle}>Save</button>
      </form>
    </div>
  );
}

const containerStyle = {
  maxWidth: "500px",
  margin: "40px auto",
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  backgroundColor: "#f9f9f9",
  fontFamily: "Arial, sans-serif",
};

const titleStyle = {
  textAlign: "center",
  color: "#2c3e50",
};

const labelStyle = {
  display: "block",
  marginTop: "15px",
  marginBottom: "5px",
  fontWeight: "bold",
  color: "#34495e",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  boxSizing: "border-box",
};

const buttonStyle = {
  marginTop: "20px",
  width: "100%",
  padding: "12px",
  backgroundColor: "#3498db",
  color: "white",
  border: "none",
  borderRadius: "4px",
  fontWeight: "bold",
  cursor: "pointer",
};

export default App;


