import { Box, Button, IconButton, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase"; // Import Firebase auth
import { signOut } from "firebase/auth";
import { useEffect } from "react";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out from Firebase
      localStorage.removeItem("user"); // Remove user information from localStorage
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* SEARCH BAR */}
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
      >
        <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton>
      </Box>

      {/* ICONS */}
      <Box display="flex">
        <Button
          onClick={handleLogout}
          variant="contained"
          color="primary"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
            fontSize: "1rem",
            border: `2px solid ${colors.tealAccent[600]}`,
            boxShadow: `0 0 10px ${colors.tealAccent[600]}`,
            background: "linear-gradient(110deg,#000103 45%,#1e2631 55%,#000103)",
            backgroundSize: "200% 100%",
            px: 2,
            color: "#9CA3AF",
            fontWeight: "500",
            textTransform: "none",
            animation: "shimmer 10s infinite",
            transition: "color 1s",
            "&:hover": {
              color: "#FFFFFF",
            },
            "&:focus": {
              outline: "none",
              boxShadow: "0 0 0 4px rgba(148, 163, 184, 0.6)",
            },
            "@keyframes shimmer": {
              "0%": { backgroundPosition: "200% 0" },
              "100%": { backgroundPosition: "-200% 0" },
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default Topbar;
