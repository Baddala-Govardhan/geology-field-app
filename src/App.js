// import React from "react";
// import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import GrainForm from "./GrainForm";
// import FlowForm from "./FlowForm"; // Create this later

// function App() {
//   return (
//     <Router>
//       <div style={{ padding: "20px" }}>
//         <h2>Geology Field Data App</h2>
//         <nav style={{ marginBottom: "20px" }}>
//           <Link to="/grain" style={{ marginRight: "15px" }}>Grain Size Form</Link>
//           <Link to="/flow">Flow Measurement Form</Link>
//         </nav>
//         <Routes>
//           <Route path="/grain" element={<GrainForm />} />
//           <Route path="/flow" element={<FlowForm />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;


import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Contact from "./pages/Contact";
import GrainForm from "./GrainForm";
import FlowForm from "./FlowForm";

function Navigation() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  const isHomePage = location.pathname === "/";
  
  if (isAuthPage) {
    return null; // Hide navigation on login/signup pages
  }

  const handleScrollClick = (e, sectionId) => {
    e.preventDefault();
    const basename = process.env.PUBLIC_URL || '/geology-field-app';
    const currentPath = window.location.pathname;
    
    if (isHomePage) {
      const element = document.getElementById(sectionId);
      if (element) {
        // Use hash only, preserve current path
        const newUrl = currentPath + `#${sectionId}`;
        window.history.pushState(null, "", newUrl);
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // If not on home page, navigate to home first, then scroll
      window.location.href = `${basename}/#${sectionId}`;
    }
  };
  
  return (
    <nav style={navStyle}>
      <div style={navContainerStyle}>
        <div style={navLinksWrapper}>
          <a 
            href="/geology-field-app/#home"
            onClick={(e) => handleScrollClick(e, "home")}
            style={{
              ...navLinkStyle,
              ...(isHomePage && (location.hash === "" || location.hash === "#home") ? activeNavLinkStyle : {})
            }}
          >
            Home
          </a>
          <a 
            href="/geology-field-app/#features"
            onClick={(e) => handleScrollClick(e, "features")}
            style={{
              ...navLinkStyle,
              ...(isHomePage && location.hash === "#features" ? activeNavLinkStyle : {})
            }}
          >
            Features
          </a>
          <a 
            href="/geology-field-app/#contact"
            onClick={(e) => handleScrollClick(e, "contact")}
            style={{
              ...navLinkStyle,
              ...(isHomePage && location.hash === "#contact" ? activeNavLinkStyle : {})
            }}
          >
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
}

function App() {
  // Set basename for GitHub Pages deployment
  const basename = process.env.PUBLIC_URL || '/geology-field-app';
  
  return (
    <Router basename={basename}>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  
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
      {!isAuthPage && (
        <header style={headerStyle}>
          <div style={headerContentStyle}>
            <h1 style={titleStyle}>Geology Field Data</h1>
            <p style={subtitleStyle}>Field research data collection system</p>
          </div>
        </header>
      )}
      
      <Navigation />
      
      <main style={mainStyle}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/contact-form" element={<Contact />} />
          <Route path="/grain" element={<GrainForm />} />
          <Route path="/flow" element={<FlowForm />} />
        </Routes>
      </main>
    </div>
  );
}

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
  borderBottom: "1px solid #dee2e6",
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
  borderBottom: "2px solid transparent",
  transition: "all 0.2s ease",
  cursor: "pointer",
  position: "relative",
};

const activeNavLinkStyle = {
  color: "#8b6f47",
  borderBottomColor: "#8b6f47",
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
