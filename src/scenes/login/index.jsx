import { useState } from "react";
import { Box, Button, TextField, Typography, useTheme, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { tokens } from "../../theme";
import { Link } from "react-router-dom";
import { auth, database } from "../../firebase"; // Import Firebase services
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";

const Login = ({ handleLoginSuccess }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check user role from the database
      const userRoleRef = ref(database, 'users/' + user.uid + '/role');
      const snapshot = await get(userRoleRef);
      
      if (snapshot.exists() && snapshot.val() === role) {
        handleLoginSuccess(role);
      } else {
        setError("Invalid credentials or role");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setRole(newRole);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor={colors.primary[500]}
    >
      <Typography variant="h4" color={colors.grey[100]} mb="20px">
        Login
      </Typography>
      <ToggleButtonGroup
        value={role}
        exclusive
        onChange={handleRoleChange}
        sx={{ marginBottom: "20px" }}
      >
        <ToggleButton value="user" sx={{ color: colors.grey[100] }}>
          User
        </ToggleButton>
        <ToggleButton value="admin" sx={{ color: colors.grey[100] }}>
          Admin
        </ToggleButton>
        <ToggleButton value="superadmin" sx={{ color: colors.grey[100] }}>
          Super Admin
        </ToggleButton>
      </ToggleButtonGroup>
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
        }}
      >
        Login
      </Button>
      <Typography variant="body1" color={colors.grey[100]} mt="20px">
        Don't have an account? <Link to="/signup" style={{ color: colors.grey[100] }}>Create one</Link>
      </Typography>
    </Box>
  );
};

export default Login;

