import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import MyData from "./pages/MyData";
import StudentId from "./pages/StudentId";
import GrainForm from "./GrainForm";
import FlowForm from "./FlowForm";
import SyncStatus from "./components/SyncStatus";
import { isAdminLoggedIn } from "./utils/auth";
import { getStudentId, registerAndSetStudentId, STUDENT_ID_CONFIG } from "./utils/database";
import { getRouterBasename } from "./utils/publicUrl";

function Navigation() {
  const location = useLocation();
  const path = (location.pathname || "").toLowerCase();
  const isAuthPage = path === "/login" || path === "/signup";
  const isAdminPage = path === "/admin";
  const isMyDataPage = path === "/my-data" || path.endsWith("/my-data") || path.includes("my-data");
  const isStudentIdPage = path === "/student-id" || path.endsWith("/student-id") || path.includes("student-id");
  // Pathnames from React Router are already relative to basename (no /geology-field-app prefix)
  const isHomePath = path === "/" || path === "";
  const isHomePage = isHomePath && !isStudentIdPage && !isMyDataPage;

  if (isAuthPage || isAdminPage) {
    return null; // Hide main nav on login/signup/admin pages
  }

  const activeKey = (() => {
    if (isStudentIdPage) return "student-id";
    if (isMyDataPage) return "my-data";
    if (!isHomePage) return null;
    const hash = (location.hash || "").toLowerCase();
    if (hash === "#features") return "features";
    if (hash === "#contact") return "contact";
    return "home";
  })();

  const linkStyleFor = (key) => ({
    ...navLinkStyle,
    textDecoration: "none",
    ...(activeKey === key ? activeNavLinkStyle : {}),
  });

  const handleScrollClick = (e, sectionId) => {
    e.preventDefault();
    const basename = getRouterBasename();
    const homePath = basename ? `${basename}/` : "/";

    if (isHomePage) {
      const element = document.getElementById(sectionId);
      if (element) {
        window.history.pushState(null, "", `${window.location.pathname}#${sectionId}`);
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      window.location.href = `${homePath}#${sectionId}`;
    }
  };
  
  return (
    <nav style={navStyle}>
      <div style={navContainerStyle}>
        <div style={navLinksWrapper}>
          <a 
            href="#home"
            onClick={(e) => handleScrollClick(e, "home")}
            style={linkStyleFor("home")}
          >
            Home
          </a>
          <a 
            href="#features"
            onClick={(e) => handleScrollClick(e, "features")}
            style={linkStyleFor("features")}
          >
            Features
          </a>
          <Link
            to="/student-id"
            style={linkStyleFor("student-id")}
          >
            Student ID
          </Link>
          <Link
            to="/my-data"
            style={linkStyleFor("my-data")}
          >
            My data
          </Link>
          <Link
            to={isAdminLoggedIn() ? "/admin" : "/login"}
            style={{ ...linkStyleFor("admin"), marginLeft: "auto" }}
          >
            Admin
          </Link>
          <a 
            href="#contact"
            onClick={(e) => handleScrollClick(e, "contact")}
            style={linkStyleFor("contact")}
          >
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
}

function App() {
  const basename = getRouterBasename();

  return (
    <Router basename={basename}>
      <AppContent />
    </Router>
  );
}

function StudentIdPrompt({ onDismiss }) {
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    setError("");
    if (!trimmed) {
      setError("Please enter a Student ID.");
      return;
    }
    const result = await registerAndSetStudentId(trimmed);
    if (!result.ok) {
      setError(result.error || "Could not save Student ID.");
      return;
    }
    onDismiss();
  };

  return (
    <div style={overlayStyle}>
      <div style={promptCardStyle}>
        <h2 style={promptTitleStyle}>Create your Student ID</h2>
        <p style={promptSubtitleStyle}>
          Set a Student ID so your data syncs across devices (phone, laptop). Use the same ID on every device.
        </p>
        <form onSubmit={handleSave} style={promptFormStyle}>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`e.g. ${STUDENT_ID_CONFIG.placeholderExample} (max ${STUDENT_ID_CONFIG.maxLength} characters)`}
            style={promptInputStyle}
            autoFocus
            maxLength={STUDENT_ID_CONFIG.maxLength}
          />
          {error && <p style={promptErrorStyle}>{error}</p>}
          <div style={promptButtonsStyle}>
            <button type="submit" style={promptPrimaryBtnStyle}>Save Student ID</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  const isGrainOrFlow = location.pathname === "/grain" || location.pathname === "/flow" ||
    location.pathname.endsWith("/grain") || location.pathname.endsWith("/flow");
  const [, setForceUpdate] = React.useState(0);

  const showPrompt = isGrainOrFlow && !getStudentId();

  const handleStudentIdDismiss = () => {
    setForceUpdate((n) => n + 1);
  };

  // Handle scroll to section on page load if hash is present
  React.useEffect(() => {
    if (location.pathname === "/" && location.hash) {
      const sectionId = location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [location.pathname, location.hash]);

  return (
    <div style={appContainerStyle}>
      {showPrompt && <StudentIdPrompt onDismiss={handleStudentIdDismiss} />}
      {!isAuthPage && (
        <header style={headerStyle}>
          <div style={headerContentStyle}>
            <h1 style={titleStyle}>Geology Field Data</h1>
            <p style={subtitleStyle}>Field research data collection system</p>
          </div>
        </header>
      )}
      
      <Navigation />
      <SyncStatus />
      
      <main style={mainStyle}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/contact-form" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/my-data" element={<MyData />} />
          <Route path="/student-id" element={<StudentId />} />
          <Route path="/grain" element={<GrainForm />} />
          <Route path="/flow" element={<FlowForm />} />
        </Routes>
      </main>
      
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "1rem",
};
const promptCardStyle = {
  background: "#fff",
  borderRadius: "8px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  padding: "1.5rem 2rem",
  maxWidth: "420px",
  width: "100%",
};
const promptTitleStyle = { margin: "0 0 0.5rem 0", fontSize: "1.35rem", color: "#2c3e50" };
const promptSubtitleStyle = { margin: "0 0 1rem 0", fontSize: "0.9rem", color: "#6c757d", lineHeight: 1.4 };
const promptFormStyle = { display: "flex", flexDirection: "column", gap: "0.5rem" };
const promptInputStyle = {
  padding: "0.6rem 0.75rem",
  border: "1.5px solid #e5e7eb",
  borderRadius: "6px",
  fontSize: "1rem",
};
const promptErrorStyle = { margin: "0", fontSize: "0.875rem", color: "#dc3545" };
const promptButtonsStyle = { display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" };
const promptPrimaryBtnStyle = {
  padding: "0.6rem 1rem",
  background: "#8b6f47",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontWeight: 600,
  cursor: "pointer",
  fontSize: "0.9rem",
};

const appContainerStyle = {
  minHeight: "100vh",
  background: "#ffffff",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
  padding: "0",
  margin: "0",
  color: "#2c3e50",
};

const headerStyle = {
  background: "#ffffff",
  padding: "2.5rem 2rem 2rem 2rem",
  textAlign: "center",
  position: "relative",
  borderBottom: "2px solid #8b6f47",
  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
};

const headerContentStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
};

const titleStyle = {
  margin: "0 0 0.5rem 0",
  fontSize: "clamp(2rem, 4vw, 2.75rem)",
  fontWeight: "600",
  color: "#2c3e50",
  letterSpacing: "-0.02em",
  lineHeight: "1.2",
  fontFamily: "'Georgia', 'Times New Roman', serif",
};

const subtitleStyle = {
  margin: "0",
  color: "#6c757d",
  fontSize: "clamp(0.875rem, 1.25vw, 1rem)",
  fontWeight: "400",
  letterSpacing: "0",
};

const navStyle = {
  background: "#ffffff",
  padding: "0",
  position: "sticky",
  top: "0",
  zIndex: "100",
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
};

const navContainerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0 2rem",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const navLinksWrapper = {
  display: "flex",
  gap: "0",
  justifyContent: "center",
};

const navLinkStyle = {
  display: "inline-block",
  padding: "1.25rem 2rem",
  textDecoration: "none",
  color: "#6c757d",
  fontWeight: "500",
  fontSize: "0.9375rem",
  letterSpacing: "0",
  borderBottom: "none",
  transition: "all 0.2s ease",
  cursor: "pointer",
  position: "relative",
};

const activeNavLinkStyle = {
  color: "#8b6f47",
  borderBottom: "2px solid #8b6f47",
  fontWeight: "600",
};

const mainStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "0",
  minHeight: "calc(100vh - 300px)",
};


// Add hover effect via inline style on component

export default App;
