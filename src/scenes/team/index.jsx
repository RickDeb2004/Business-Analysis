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
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";
import { useEffect, useState } from "react";
import { auth, database } from "../../firebase";
import {
  off,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  ref,
  get,
  update,
  set,
  remove,
} from "firebase/database";
import { v4 as uuidv4 } from "uuid";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Delete from "@mui/icons-material/Delete";
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
  const [currentUserRole, setCurrentUserRole] = useState(null);

  const [adminName, setAdminName] = useState("");
  const [adminID, setAdminID] = useState("");

  const user = auth.currentUser;

  // Fetch userRole and admin name from the database
  useEffect(() => {
    if (user) {
      const adminRef = ref(database, "admins/" + user.uid);

      const getAdminData = async () => {
        const adminSnapshot = await get(adminRef);

        if (adminSnapshot.exists()) {
          const adminData = adminSnapshot.val();
          setCurrentUserRole(adminData.role);
          setAdminName(adminData.name);
          setAdminID(user.uid);
        }
      };

      getAdminData();
    }
  }, [user]);

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
      field: "delete",
      headerName: "Delete",
      flex: 1,
      renderCell: ({ row }) => (
        <Button
          onClick={() => handleConfirmDelete(row)}
          sx={{ color: colors.redAccent[400] }}
        >
          <Delete />
        </Button>
      ),
    },
  ];

  columns.push({
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
  });
  columns.push({
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
  });

  useEffect(() => {
    if (adminID) {
      const userListRef = ref(database, `userList/${adminID}`);

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
        userListRef,
        handleChildAddedOrChanged
      );
      const childChangedListener = onChildChanged(
        userListRef,
        handleChildAddedOrChanged
      );
      const childRemovedListener = onChildRemoved(
        userListRef,
        handleChildRemoved
      );

      return () => {
        off(userListRef, "child_added", childAddedListener);
        off(userListRef, "child_changed", childChangedListener);
        off(userListRef, "child_removed", childRemovedListener);
      };
    }
  }, [adminID]);

  const handleBlockUser = async (userId, blockStatus) => {
    const userRef = ref(database, `userList/${adminID}/${userId}`);

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
      // Editing an existing user
      const userRef = ref(database, `userList/${adminID}/${selectedUser.id}`);
      const updatedUserData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (formData.password) {
        updatedUserData.password = formData.password;
      }

      try {
        await update(userRef, updatedUserData);
        handleDialogClose();
      } catch (error) {
        console.error("Error updating user:", error);
      }
    } else {
      const userData = {
        uid: `${adminID}_${uuidv4()}`,
        email: formData.email,
        password: formData.password,
        displayName: formData.name,
        role: formData.role,
      };

      try {
        const response = await fetch("http://localhost:3000/create-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          throw new Error("Error creating user");
        }

        // save to rolemail
        const roleMailRef = ref(database, `rolemail/${userData.uid}`);
        await set(roleMailRef, {
          email: userData.email,
          role: userData.role,
        });

        const data = await response.json();
        console.log("User created with UID:", data.uid);

        handleDialogClose();
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleConfirmDelete = async (user) => {
    try {
      const userRef = ref(database, `userList/${adminID}/${user.id}`);
      const roleMailRef = ref(database, `rolemail/${user.id}`);
      await remove(userRef);
      await remove(roleMailRef);
      setUserData((prevUserData) =>
        prevUserData.filter((u) => u.id !== user.id)
      );
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };
  const lampEffectStyle = {
    position: "absolute",
    background: "linear-gradient(to top, #00bfff, transparent)",
    "&::after": {
      content: '""',
      position: "relative",
      left: 0,

      width: "100%",

      background:
        "linear-gradient(to top, rgba(0, 191, 255, 0.8), transparent)",
      boxShadow:
        "0 0 10px rgba(0, 191, 255, 0.8), 0 0 20px rgba(0, 191, 255, 0.8), 0 0 30px rgba(0, 191, 255, 0.8)",
    },
  };

  return (
    <Box m="20px">
      <Header title="TEAM" subtitle="Managing the Team Members" />
      {currentUserRole === "admin" && (
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

              border: `2px solid ${colors.tealAccent[600]}`,
              boxShadow: `0 0 10px ${colors.tealAccent[600]}`,
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
            Add Member
          </Button>
        </Box>
      )}

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
            fontSize: "1rem",
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
          "& .MuiDataGrid-row": {
            fontSize: "0.9rem", // Increase font size for user data
          },
        }}
      >
        <DataGrid
          checkboxSelection
          rows={userData}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          sx={{
            border: `5px solid ${colors.tealAccent[600]}`,
            boxShadow: `0 0 10px ${colors.tealAccent[600]}`,
            "@media (prefers-color-scheme: dark)": {
              bgcolor: "#18181b",
            },
          }}
        />
      </Box>
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        sx={{
          ...lampEffectStyle,
          "& .MuiDialog-paper": {
            border: "1px solid transparent",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "10px",
              background:
                "linear-gradient(to top, rgba(0, 191, 255, 0.8), transparent)",
              boxShadow:
                "0 0 10px rgba(0, 191, 255, 0.8), 0 0 20px rgba(0, 191, 255, 0.8), 0 0 30px rgba(0, 191, 255, 0.8)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{ backgroundColor: "#000000", color: colors.yellowAccent[600] }}
        >
          {selectedUser ? "Edit User" : "Add User"}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#000000" }}>
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{
              marginBottom: "10px",
              boxShadow:
                "0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)",
              "&:hover": {
                boxShadow: "0px 0px 8px 2px rgba(33,150,243,0.5)",
              },
            }}
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
            sx={{
              marginBottom: "10px",
              boxShadow:
                "0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)",
              "&:hover": {
                boxShadow: "0px 0px 8px 2px rgba(33,150,243,0.5)",
              },
            }}
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
            sx={{
              marginBottom: "10px",
              boxShadow:
                "0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)",
              "&:hover": {
                boxShadow: "0px 0px 8px 2px rgba(33,150,243,0.5)",
              },
            }}
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
              <MenuItem value="admin">Developer</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#000000" }}>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleFormSubmit} color="info">
            {selectedUser ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Team;
