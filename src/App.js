import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Contacts from "./scenes/contacts";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";
import Login from "./scenes/login/index";
import AdminList from "./scenes/AdminList";
import Feedback from "./scenes/feedback";
import Notifications from "./components/Notification";
 // Import the new page component
import Page from "./components/Pages";
function App() {
  const [theme, colorMode] = useMode();
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setLoggedIn(true);
      setUserRole(storedUser.role);
      setSidebarVisible(storedUser.role === "admin");
      if (storedUser.role === "superadmin") {
        navigate("/admins");
      } else if (storedUser.role === "user") {
        navigate("/page");  // Navigate to the new page for "user" role
      } else {
        navigate("/dashboard");
      }
    }
  }, []);

  const handleLoginSuccess = (role) => {
    setLoggedIn(true);
    setUserRole(role);
    setSidebarVisible(role === "admin");
    if (role === "superadmin") {
      navigate("/admins");
    } else if (role === "user") {
      navigate("/page");  // Navigate to the new page for "user" role
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUserRole(null);
    setSidebarVisible(false);
    navigate("/");
  };

  const showTopbar = isLoggedIn && location.pathname !== "/";

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          {isSidebarVisible && <Sidebar />}
          <main className="content">
            {showTopbar && <Topbar handleLogout={handleLogout} />}
            <Routes>
              <Route
                path="/"
                element={<Login handleLoginSuccess={handleLoginSuccess} />}
              />
              <Route path="/admins" element={<AdminList />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/team" element={<Team />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/form" element={<Form />} />
              <Route path="/bar" element={<Bar />} />
              <Route path="/pie" element={<Pie />} />
              <Route path="/line" element={<Line />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/geography" element={<Geography />} />
              <Route path="/page" element={<Page />} />  {/* Add the new page route */}
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
