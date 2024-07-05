import { Box, Button, IconButton, useTheme, Badge } from "@mui/material";
import { tokens } from "../../theme";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, database } from "../../firebase"; // Import Firebase auth
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { get, ref } from "firebase/database";
import ChatIcon from "@mui/icons-material/Chat";
const Topbar = ({ handleLogout }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [messages, setMessages] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  const handleLogoutdb = async () => {
    try {
      await signOut(auth); // Sign out from Firebase
      localStorage.removeItem("user"); // Remove user information from localStorage
      handleLogout(); // Call the parent function to update the state
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
      return;
    }

    const fetchMessagesAndUserRole = async () => {

      const currentUser = auth.currentUser || storedUser;

      if (!currentUser) {
        navigate("/");
        return;
      }


      const userRef = ref(database, `rolemail/${currentUser.uid}`);

      const userSnapshot = await get(userRef);
      let userData;
      if (userSnapshot.exists()) {
        userData = userSnapshot.val();
        setCurrentUserRole(userData.role);
      }
      
      if (userData && userData.role === "admin") {
        const messagesRef = ref(database, "messages");
        const snapshot = await get(messagesRef);
        if (snapshot.exists()) {
          const messagesData = snapshot.val();
          const allMessages = Object.values(messagesData).flatMap((userMessages) =>
            Object.values(userMessages)
          );
          setMessages(allMessages);
          setUnreadMessagesCount(allMessages.length); // Update this logic to count only unread messages if necessary
        }
      }
    };

    fetchMessagesAndUserRole();

  }, [handleLogout]);


  return (
    <Box display="flex" justifyContent="flex-end" p={2}>
      {currentUserRole === "admin" && location.pathname !== "/admins" && (
        <Box mr={2}>
        <IconButton color="inherit" onClick={() => navigate("/notifications")}>
          <Badge badgeContent={unreadMessagesCount} color="secondary">
            <ChatIcon />
          </Badge>
        </IconButton>
        </Box>
      )}

      <Button
        onClick={handleLogoutdb}
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
  );
};

export default Topbar;
