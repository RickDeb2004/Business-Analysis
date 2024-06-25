import { useState } from "react";
import { Box, Button, TextField, Typography, useTheme, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { tokens } from "../../theme";
import { Link } from "react-router-dom";
import { auth, database } from "../../firebase"; // Import Firebase services
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";

const Signup = ({ handleSignupSuccess }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store additional user info (role) in the database
      await set(ref(database, 'users/' + user.uid), {
        email: user.email,
        name: name,
        role: role,
        password: password,
      });
      
      handleSignupSuccess();
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
        Signup
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
        label="Name"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
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
        onClick={handleSignup}
        sx={{
          backgroundColor: colors.blueAccent[700],
          color: colors.grey[100],
          fontSize: "14px",
          fontWeight: "bold",
          padding: "10px 20px",
        }}
      >
        Signup
      </Button>
      <Typography variant="body1" color={colors.grey[100]} mt="20px">
        Already have an account? <Link to="/" style={{ color: colors.grey[100] }}>Login</Link>
      </Typography>
    </Box>
  );
};

export default Signup;
