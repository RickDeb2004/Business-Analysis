import {
  Box,
  Typography,
  useTheme,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";
import { useEffect, useState } from "react";
import { database } from "../../firebase";
import {
  off,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  ref,
  get,
  remove,
  update,
  set,
} from "firebase/database";
import { v4 as uuidv4 } from "uuid";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [userData, setUserData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const columns = [
    { field: "id", headerName: "UID", flex: 1 },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "email",
      headerName: "Email",
      type: "text",
      headerAlign: "left",
      align: "left",
      flex: 1,
    },
    { field: "signInTime", headerName: "Login Time", flex: 1 },
    {
      field: "role",
      headerName: "Access Level",
      flex: 1,
      renderCell: ({ row: { role } }) => (
        <Box
          width="60%"
          m="0 auto"
          p="5px"
          display="flex"
          justifyContent="center"
          backgroundColor={
            role === "admin" ? colors.greenAccent[600] : colors.greenAccent[700]
          }
          borderRadius="4px"
        >
          {role === "admin" && <AdminPanelSettingsOutlinedIcon />}
          {role === "manager" && <SecurityOutlinedIcon />}
          {role === "user" && <LockOpenOutlinedIcon />}
          <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
            {role}
          </Typography>
        </Box>
      ),
    },
    {
      field: "password",
      headerName: "Password",
      flex: 1,
    },
    {
      field: "blocked",
      headerName: "Blocked",
      flex: 1,
      renderCell: ({ row }) => (
        <Button
          onClick={() => handleBlockUser(row.id, !row.blocked)}
          sx={{ color: row.blocked ? "green" : "red" }}
        >
          {row.blocked ? "Unblock" : "Block"}
        </Button>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: ({ row }) => (
        <Button
          onClick={() => handleEditUser(row)}
          sx={{ color: colors.grey[100] }}
        >
          Edit
        </Button>
      ),
    },
  ];

  useEffect(() => {
    const userActivityRef = ref(database, "userActivity");

    const handleChildAddedOrChanged = (snapshot) => {
      const data = snapshot.val();
      setUserData((prevUserData) => {
        const existingIndex = prevUserData.findIndex(
          (item) => item.id === snapshot.key
        );
        if (existingIndex !== -1) {
          const updatedUserData = [...prevUserData];
          updatedUserData[existingIndex] = { id: snapshot.key, ...data };
          return updatedUserData;
        } else {
          return [...prevUserData, { id: snapshot.key, ...data }];
        }
      });
    };

    const handleChildRemoved = (snapshot) => {
      setUserData((prevUserData) =>
        prevUserData.filter((item) => item.id !== snapshot.key)
      );
    };

    const childAddedListener = onChildAdded(
      userActivityRef,
      handleChildAddedOrChanged
    );
    const childChangedListener = onChildChanged(
      userActivityRef,
      handleChildAddedOrChanged
    );
    const childRemovedListener = onChildRemoved(
      userActivityRef,
      handleChildRemoved
    );

    return () => {
      off(userActivityRef, "child_added", childAddedListener);
      off(userActivityRef, "child_changed", childChangedListener);
      off(userActivityRef, "child_removed", childRemovedListener);
    };
  }, []);

  useEffect(() => {
    const cleanupOldActivities = async () => {
      const userActivityRef = ref(database, "userActivity");
      const snapshot = await get(userActivityRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const now = new Date().getTime();
        const oneDay = 24 * 60 * 60 * 1000;

        for (let key in data) {
          const activity = data[key];
          const signInTime = new Date(activity.signInTime).getTime();

          if (now - signInTime > oneDay) {
            const activityRef = ref(database, `userActivity/${key}`);
            await remove(activityRef);
          }
        }
      }
    };

    cleanupOldActivities();
    const interval = setInterval(cleanupOldActivities, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleBlockUser = async (userId, blockStatus) => {
    const userRef = ref(database, `userActivity/${userId}`);
    await update(userRef, { blocked: blockStatus });
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({ name: "", email: "", password: "", role: "user" });
  };

  const handleFormSubmit = async () => {
    if (selectedUser) {
      const userRef = ref(database, `userActivity/${selectedUser.id}`);
      const updates = { ...formData };
      if (!formData.password) delete updates.password; // Do not update password if it's empty
      await update(userRef, updates);
    } else {
      const newUserId = uuidv4();
      const userRef = ref(database, `userActivity/${newUserId}`);
      await set(userRef, {
        ...formData,
        signInTime: new Date().toISOString(),
        blocked: false,
      });
    }
    handleDialogClose();
  };

  return (
    <Box m="20px">
      <Header title="TEAM" subtitle="Managing the Team Members" />
      <Box display="flex" justifyContent="flex-start" mb="20px">
        <Button
          onClick={() => setOpenDialog(true)}
          variant="contained"
          color="primary"
          sx={{
            display: "inline-flex",
            height: "48px",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
            border: "1px solid #374151",
            background:
              "linear-gradient(110deg,#000103 45%,#1e2631 55%,#000103)",
            backgroundSize: "200% 100%",
            px: 6,
            color: "#9CA3AF",
            fontWeight: "500",
            textTransform: "none",
            animation: "shimmer 2s infinite",
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
          Add User
        </Button>
      </Box>

      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .name-column--cell": { color: colors.greenAccent[300] },
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
          checkboxSelection
          rows={userData}
          columns={columns}
          sx={{
            border: `5px solid ${colors.tealAccent[600]}`,
            boxShadow: `0 0 10px ${colors.tealAccent[600]}`,
            "@media (prefers-color-scheme: dark)": {
              bgcolor: "#18181b",
            },
          }}
        />
      </Box>
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{selectedUser ? "Edit User" : "Add User"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleFormSubmit} color="primary">
            {selectedUser ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Team;
