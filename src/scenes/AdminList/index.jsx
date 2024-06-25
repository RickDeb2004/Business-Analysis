import { useState, useEffect } from "react";
import { Box, Button, IconButton } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { ref, get, remove } from "firebase/database";
import { auth, database } from "../../firebase";
import Header from "../../components/Header";
import DeleteIcon from "@mui/icons-material/Delete";
import ChatIcon from "@mui/icons-material/Chat";
import { useNavigate } from "react-router-dom";
import { tokens } from "../../theme";

const AdminList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [admins, setAdmins] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null); // To store the current user's role
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdmins = async () => {
      const adminsRef = ref(database, "users");
      const snapshot = await get(adminsRef);
      if (snapshot.exists()) {
        const users = snapshot.val();
        const adminList = Object.keys(users)
          .filter(key => users[key].role === "admin") // Exclude super admins
          .map(key => ({ id: key, ...users[key] }));
        setAdmins(adminList);

        // Get the current user's ID and role
        const currentUserId = auth.currentUser.uid;
        if (users[currentUserId]) {
          setCurrentUserRole(users[currentUserId].role);
        }
      }
    };
    fetchAdmins();
  }, []);

  const handleDelete = async (id) => {
    try {
      await remove(ref(database, `users/${id}`));
      setAdmins(admins.filter((admin) => admin.id !== id));
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  const handleChat = (id) => {
    // Navigate to the chat thread for the selected admin
    navigate(`/chat/${id}`);
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
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
                sx={{ marginRight: 1 }}
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
      <Header
        title="ADMINS"
        subtitle="List of Admins"
      />
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
