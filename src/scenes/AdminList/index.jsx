import { useState, useEffect } from "react";
import { Box, Button, IconButton } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import {
  ref,
  get,
  remove,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  off,
} from "firebase/database";
import { auth, database } from "../../firebase";
import Header from "../../components/Header";
import DeleteIcon from "@mui/icons-material/Delete";
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate } from "react-router-dom";

const AdminList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [admins, setAdmins] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null); // To store the current user's role
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdmins = async () => {
      const adminsRef = ref(database, "adminActivity");
      const snapshot = await get(adminsRef);
      if (snapshot.exists()) {
        const users = snapshot.val();

        const adminList = Object.keys(users).map((key) => ({
          id: key,
          ...users[key],
        }));
        setAdmins(adminList);

        const adminList = Object.keys(users).map(key => ({ id: key, ...users[key] }));

        // Fetch feedbacks and merge with admin data
        const feedbackRef = ref(database, "feedback");
        const feedbackSnapshot = await get(feedbackRef);
        const feedbackData = feedbackSnapshot.exists() ? feedbackSnapshot.val() : {};

        const adminListWithFeedback = adminList.map(admin => {
          const adminFeedbacks = feedbackData[admin.uid] ? Object.values(feedbackData[admin.uid]) : [];
          return { ...admin, feedback: adminFeedbacks.map(fb => fb.feedback).join(", ") };
        });

        setAdmins(adminListWithFeedback);

        // Get the current user's ID and role
        const currentUserId = auth.currentUser.uid;
        const usersRef = ref(database, "users");
        const usersSnapshot = await get(usersRef);
        if (usersSnapshot.exists()) {
          const usersData = usersSnapshot.val();
          if (usersData[currentUserId]) {
            setCurrentUserRole(usersData[currentUserId].role);
          }
        }
      }
    };
    fetchAdmins();
  }, []);

  useEffect(() => {
    const adminActivityRef = ref(database, "adminActivity");

    const handleChildAddedOrChanged = async (snapshot) => {
      const data = snapshot.val();
      const feedbackRef = ref(database, `feedback/${data.uid}`);
      const feedbackSnapshot = await get(feedbackRef);
      const feedbacks = feedbackSnapshot.exists() ? Object.values(feedbackSnapshot.val()) : [];
      const feedbackText = feedbacks.map(fb => fb.feedback).join(", ");

      setAdmins((prevAdmins) => {
        const existingIndex = prevAdmins.findIndex(
          (item) => item.id === snapshot.key
        );
        if (existingIndex !== -1) {
          const updatedAdmins = [...prevAdmins];
          updatedAdmins[existingIndex] = { id: snapshot.key, ...data, feedback: feedbackText };
          return updatedAdmins;
        } else {
          return [...prevAdmins, { id: snapshot.key, ...data, feedback: feedbackText }];
        }
      });
    };

    const handleChildRemoved = (snapshot) => {
      setAdmins((prevAdmins) =>
        prevAdmins.filter((item) => item.id !== snapshot.key)
      );
    };

    const childAddedListener = onChildAdded(
      adminActivityRef,
      handleChildAddedOrChanged
    );
    const childChangedListener = onChildChanged(
      adminActivityRef,
      handleChildAddedOrChanged
    );
    const childRemovedListener = onChildRemoved(
      adminActivityRef,
      handleChildRemoved
    );

    return () => {
      off(adminActivityRef, "child_added", childAddedListener);
      off(adminActivityRef, "child_changed", childChangedListener);
      off(adminActivityRef, "child_removed", childRemovedListener);
    };
  }, []);

  useEffect(() => {
    const cleanupOldActivities = async () => {
      const adminActivityRef = ref(database, "adminActivity");
      const snapshot = await get(adminActivityRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const now = new Date().getTime();
        const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        for (let key in data) {
          const activity = data[key];
          const signInTime = new Date(activity.signInTime).getTime();

          if (now - signInTime > oneDay) {
            const activityRef = ref(database, `adminActivity/${key}`);
            await remove(activityRef);
          }
        }
      }
    };

    cleanupOldActivities();
    const interval = setInterval(cleanupOldActivities, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id) => {
    try {
      await remove(ref(database, `adminActivity/${id}`));
      setAdmins(admins.filter((admin) => admin.id !== id));
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  const handleChat = (id) => {
    navigate(`/chat/${id}`);
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Name", flex: 0.75 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "signInTime", headerName: "Login Time", flex: 1 },
    { field: "feedback", headerName: "Feedback", flex: 2 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/dashboard`)}
            sx={{ marginRight: 1 }}
          >
            View Profile
          </Button>
          {currentUserRole === "superadmin" && (
            <>
              <IconButton
                color="secondary"
                sx={{ marginRight: 1, color: colors.redAccent[600] }}
                onClick={() => handleDelete(params.id)}
              >
                <DeleteIcon />
              </IconButton>
              <IconButton
                color="primary"
                sx={{ color: "#ffffff" }}
                onClick={() => handleChat(params.id)}
              >
                <ChatIcon />
              </IconButton>
            </>
          )}
        </>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="ADMINS" subtitle="List of Admins" />
      <Box
        m="40px 0 0 0"
        height="75vh"
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
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={admins}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>
    </Box>
  );
};

export default AdminList;