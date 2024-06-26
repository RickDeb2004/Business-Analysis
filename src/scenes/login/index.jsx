import { useState } from "react";
import { Box, Button, TextField, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { Link } from "react-router-dom";
import { auth, database } from "../../firebase"; // Import Firebase services
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get, set, push } from "firebase/database"; // Import necessary database functions

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
        if (role === "user" || role === "admin") {
          const activityRef = ref(database, `${role}Activity`);
          const newActivityRef = push(activityRef);
          await set(newActivityRef, {
            uid: user.uid,
            name: userName,
            email: user.email,
            role: role,
            signInTime: new Date().toISOString(),
          });
        }

        handleLoginSuccess(role);
      } else {
        setError("Invalid credentials");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{
        bgcolor: 'background.default',
       
        
        '@media (prefers-color-scheme: dark)': {
          bgcolor: '#18181b',
        },
      }}
    >
      <Typography variant="h4" color={colors.grey[100]} mb="20px">
        Login
      </Typography>
      <TextField
        label="Email"
        variant="outlined"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ marginBottom: "20px", input: { color: colors.grey[100] } }}
        InputLabelProps={{ style: { color: colors.grey[100] } }}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ marginBottom: "20px", input: { color: colors.grey[100] } }}
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
        }}
      >
        Login
      </Button>
      <Typography variant="body1" color={colors.grey[100]}>
        Don't have an account?{" "}
        <Link to="/signup" style={{ color: colors.grey[100] }}>
          Create one
        </Link>
      </Typography>
    </Box>
  );
};

export default Login;
