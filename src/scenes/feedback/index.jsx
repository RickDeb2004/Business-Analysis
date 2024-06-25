import { Box, Button, TextareaAutosize, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { getAuth } from "firebase/auth";
import { get, ref, set, onValue } from "firebase/database";
import { useEffect, useState } from "react";
import { database } from "../../firebase";

const Feedback = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [role, setRole] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [allFeedbacks, setAllFeedbacks] = useState([]);

  useEffect(() => {
    const fetchUserRole = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setRole(userData.role);
        }
      }
    };

    const fetchFeedbacks = () => {
      const feedbackRef = ref(database, 'feedback');
      onValue(feedbackRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const feedbackList = Object.keys(data).map(key => ({
            id: key,
            ...data[key],
          }));
          setAllFeedbacks(feedbackList);
        }
      });
    };

    fetchUserRole();
    fetchFeedbacks();
  }, []);

  const handleSubmit = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      let userName = "Anonymous";
      if (snapshot.exists()) {
        const userData = snapshot.val();
        userName = userData.name || "Anonymous";
      }

      const feedbackRef = ref(database, `feedback/${user.uid}`);
      await set(feedbackRef, {
        name: userName,
        email: user.email,
        role: role,
        feedback: feedback,
      });
      setFeedback("");
    }
  };

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "role", headerName: "Role", flex: 1 },
    { field: "feedback", headerName: "Feedback", flex: 2 },
  ];

  return (
    <Box m="20px">
      <Header title="Feedback" subtitle="Every improvement starts with a feedback" />
      {role === "admin" ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="70vh"
          bgcolor={colors.primary[400]}
          borderRadius="8px"
          p="20px"
        >
          <TextareaAutosize
            aria-label="minimum height"
            minRows={15}
            placeholder="Enter your feedback here"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            style={{
              width: "70%",
              padding: "10px",
              borderRadius: "4px",
              backgroundColor: "transparent",
              border: `1px solid ${colors.grey[100]}`,
              color: colors.grey[100],
              outline: "none",
              transition: "border-color 0.3s",
            }}
            onFocus={(e) => e.target.style.borderColor = "cyan"}
            onBlur={(e) => e.target.style.borderColor = colors.grey[100]}
          />
          <Button
            onClick={handleSubmit}
            sx={{
              marginTop: "20px",
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
              "&:hover": {
                backgroundColor: colors.blueAccent[800],
              },
            }}
          >
            Submit
          </Button>
        </Box>
      ) : role === "superadmin" ? (
        <Box
          mt="20px"
          height="70vh"
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
            "& .name-column--cell": {
              color: colors.greenAccent[300],
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: colors.blueAccent[700],
              borderBottom: "none",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: colors.blueAccent[700],
            },
            "& .MuiCheckbox-root": {
              color: `${colors.greenAccent[200]} !important`,
            },
          }}
        >
          <DataGrid
            rows={allFeedbacks}
            columns={columns}
            components={{ Toolbar: GridToolbar }}
          />
        </Box>
      ) : (
        <Typography variant="h6" color={colors.grey[100]}>
          Loading...
        </Typography>
      )}
    </Box>
  );
};

export default Feedback;
