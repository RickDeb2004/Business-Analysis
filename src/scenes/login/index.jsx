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
  const [userUID, setUserUID] = useState("");



  const handleLogin = async () => {
    try {

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;


      // Fetch the role from the rolemail node
      const roleMailRef = ref(database, "rolemail");

      const roleMailSnapshot = await get(roleMailRef);
      // console.log("roleMailRef", roleMailRef);
      // console.log("roleMailSnapshot", roleMailSnapshot);

      if (roleMailSnapshot.exists()) {
        const roleMailData = roleMailSnapshot.val();
        const userEntry = Object.entries(roleMailData).find(
          ([key, value]) => value.email === email
        );

        if (userEntry) {
          const [userId, userInfo] = userEntry;
          const { role } = userInfo;
          console.log("userentry", userEntry, userInfo);

          if (role === "superadmin") {
            // Fetch the user details from the users database for superadmin
            const userRef = ref(database, "users/" + userId);
            console.log("userref", userRef);
            const userSnapshot = await get(userRef);
            console.log("usersnapshot", userSnapshot);
            if (userSnapshot.exists()) {
              const userData = userSnapshot.val();
              console.log("userdata", userData);
              if (userData.password === password) {
                // Superadmin authenticated successfully
                handleLoginSuccess(role);
                // Store user information in localStorage
                localStorage.setItem(
                  "user",
                  JSON.stringify({ uid: userId, role })
                );
                return;
              } else {
                setError("Invalid superadmin credentials");
                return;
              }
            } else {
              setError("Superadmin not found");
              return;
            }
          } else if (role === "admin") {
            // For admin, check the password in the admins node
            const adminRef = ref(database, "admins/" + userId);
            const adminSnapshot = await get(adminRef);
            if (adminSnapshot.exists()) {
              const adminData = adminSnapshot.val();
              if (adminData.password === password) {
                // Admin authenticated successfully
                handleLoginSuccess(role);
                // Store user information in localStorage
                localStorage.setItem(
                  "user",
                  JSON.stringify({ uid: userId, role })
                );
                return;
              } else {
                setError("Invalid admin credentials");
                return;
              }
            } else {
              setError("Admin not found");
              return;
            }
          } else if (role === "user") {
            // For admin, check the password in the admins node
            const useridSplit = userId.split("_")[0];
            // console.log("useridSplit", useridSplit);
            const useRef = ref(
              database,
              "userList/" + useridSplit + "/" + userId
            );

            const useSnapshot = await get(useRef);
            console.log("useSnapshot", useSnapshot);
            if (useSnapshot.exists()) {
              const useData = useSnapshot.val();
              if (useData.blocked) {
                await auth.signOut();
                setError(
                  "Your account has been blocked. Please contact support."
                );
                return;
              }
              if (useData.password === password) {
                // Admin authenticated successfully
                handleLoginSuccess(role);
                // Store user information in localStorage
                localStorage.setItem(
                  "user",
                  JSON.stringify({ uid: userId, role })
                );
                // update the signInTime
                const hour = new Date().getHours();
                const minute = new Date().getMinutes();
                const signInTime = `${hour}:${minute}`;
                const DateMonth = new Date().getMonth();
                const DateDay = new Date().getDate();
                const loginTime = `${signInTime} - ${DateMonth}/${DateDay}`;
                console.log("loginTime", loginTime);
                const signInTimeRef = ref(
                  database,
                  "userList/" + useridSplit + "/" + userId + "/signInTime"
                );
                await set(signInTimeRef, loginTime);
                return;
              } else {
                setError("Invalid user credentials");
                return;
              }
            } else {
              setError("user not found");
              return;
            }
          } else {
            setError("Not an admin or superadmin or user account");
            return;
          }
        } else {
          setError("Email not found");
          return;
        }
      } else {
        setError("No role data found");
        return;

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
