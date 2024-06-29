import { useEffect, useState } from "react";
import { Box, Button, TextField, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { auth, database } from "../../firebase"; // Import Firebase services
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get, set, push, update } from "firebase/database"; // Import necessary database functions

const Login = ({ handleLoginSuccess }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");



  const handleLogin = async () => {
    try {
      
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check user role from the database
      const userRoleRef = ref(database, "users/" + user.uid + "/role");
      const snapshot = await get(userRoleRef);

      if (snapshot.exists()) {
        const role = snapshot.val();

        // Get user name
        const userNameRef = ref(database, "users/" + user.uid + "/name");
        const userNameSnapshot = await get(userNameRef);
        const userName = userNameSnapshot.exists()
          ? userNameSnapshot.val()
          : "Unknown User";

        // Record the sign-in activity
        // Record the sign-in activity
        if (role === "user" || role === "admin") {
          const activityRef = ref(database, `${role}Activity`);

          // Fetch existing activities
          const existingActivitiesSnapshot = await get(activityRef);
          let existingActivityKey = null;

          if (existingActivitiesSnapshot.exists()) {
            const activities = existingActivitiesSnapshot.val();
            for (const [key, activity] of Object.entries(activities)) {
              if (activity.email === user.email) {
                existingActivityKey = key;
                break;
              }
            }
          }

          const now = new Date();
          const hours = now.getHours().toString().padStart(2, "0");
          const minutes = now.getMinutes().toString().padStart(2, "0");
          const time = `${hours}:${minutes}`;
          const day = now.getDate().toString().padStart(2, "0");
          const month = (now.getMonth() + 1).toString().padStart(2, "0");
          const year = now.getFullYear().toString().slice(-2);
          const date = `${day}/${month}/${year}`;
          const formattedTime = `${time} - ${date}`;

          if (existingActivityKey) {
            // Update existing activity
            const existingActivityRef = ref(
              database,
              `${role}Activity/${existingActivityKey}`
            );
            await update(existingActivityRef, {
              signInTime: formattedTime,
            });
          } else {
            // Push new activity
            const newActivityRef = push(activityRef);
            await set(newActivityRef, {
              uid: user.uid,
              name: userName,
              email: user.email,
              role: role,
              signInTime: formattedTime,
            });
          }
        }

        // Store user information in localStorage
        localStorage.setItem("user", JSON.stringify({ uid: user.uid, role }));

        handleLoginSuccess(role);
        // navigate("/dashboard");
      } else {
        setError("Invalid credentials");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const lampEffectStyle = {
    position: "relative",
    background: "black",
    boxShadow:
      "0 0 10px rgba(0, 191, 255, 0.8), 0 0 20px rgba(0, 191, 255, 0.8), 0 0 30px rgba(0, 191, 255, 0.8)",
    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      width: "100%",
      boxShadow:
        "0 0 10px rgba(0, 191, 255, 0.8), 0 0 20px rgba(0, 191, 255, 0.8), 0 0 30px rgba(0, 191, 255, 0.8)",
    },
  };

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        // "@media (prefers-color-scheme: dark)": {
        //   bgcolor: '#18181b',
        // },
        ...lampEffectStyle,
        padding: "20px",
        boxShadow:
          "0 0 10px rgba(0, 191, 255, 0.8), 0 0 20px rgba(0, 191, 255, 0.8), 0 0 30px rgba(0, 191, 255, 0.8)",
        maxWidth: "500px",
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        mt: "30vh",
      }}
    >
      <Typography variant="h4" color={colors.grey[100]} mb="40px">
        Enter credentials to Login
      </Typography>
      <TextField
        label="Email"
        variant="outlined"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{
          marginBottom: "40px",
          input: { color: colors.grey[100] },
          boxShadow:
            "0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)",
          "&:hover": {
            boxShadow: "0px 0px 8px 2px rgba(33,150,243,0.5)",
          },
        }}
        InputLabelProps={{ style: { color: colors.grey[100] } }}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{
          marginBottom: "40px",
          input: { color: colors.grey[100] },
          boxShadow:
            "0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)",
          "&:hover": {
            boxShadow: "0px 0px 8px 2px rgba(33,150,243,0.5)",
          },
        }}
        InputLabelProps={{ style: { color: colors.grey[100] } }}
      />
      {error && (
        <Typography variant="body1" color="red" mt="10px">
          {error}
        </Typography>
      )}
      <Button
        onClick={handleLogin}
        sx={{
          backgroundColor: colors.blueAccent[700],
          color: colors.grey[100],
          fontSize: "14px",
          fontWeight: "bold",
          padding: "10px 20px",
          marginBottom: "20px",
          borderRadius: "8px",
          border: `2px solid ${colors.tealAccent[600]}`,
          boxShadow: `0 0 10px ${colors.tealAccent[600]}`,
          background: "linear-gradient(110deg,#000103 45%,#1e2631 55%,#000103)",
          backgroundSize: "200% 100%",
          animation: "shimmer 6s infinite",
          transition: "color 0.3s",
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
        LOGIN
      </Button>
    </Box>
  );
};

export default Login;
