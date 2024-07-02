import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  TextField,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import {
  ref,
  get,
  set,
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
import { createUserWithEmailAndPassword } from "firebase/auth";

const AdminList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [admins, setAdmins] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null); // To store the current user's role
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });
  const [openChatDialog, setOpenChatDialog] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [messages, setMessages] = useState([]);

  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdmins = async () => {
      const adminsRef = ref(database, "admins");
      const snapshot = await get(adminsRef);
      if (snapshot.exists()) {
        const users = snapshot.val();

        const adminList = Object.keys(users).map((key) => ({
          id: key,
          ...users[key],
        }));

        // Fetch feedbacks and merge with admin data
        const feedbackRef = ref(database, "feedback");
        const feedbackSnapshot = await get(feedbackRef);
        const feedbackData = feedbackSnapshot.exists()
          ? feedbackSnapshot.val()
          : {};

        // console.log(feedbackData)
        const adminListWithFeedback = adminList.map((admin) => {
          // console.log(admin.uid)
          const adminFeedbacks = feedbackData[admin.uid]
            ? Object.values(feedbackData[admin.uid])
            : [];
          // console.log(adminFeedbacks)
          // Get the most recent feedback
          const length = adminFeedbacks.length;
          const latestFeedback = length > 0 ? adminFeedbacks[length - 1] : null;

          return {
            ...admin,
            feedback: latestFeedback ? latestFeedback.feedback : "No feedback",
          };
        });

        setAdmins(adminListWithFeedback);

        // Get the current user's ID and role
        const currentUserId = auth.currentUser.uid;
        const roleMailRef = ref(database, `rolemail/${currentUserId}`);
        const roleMailSnapshot = await get(roleMailRef);
        if (roleMailSnapshot.exists()) {
          const currentUserData = roleMailSnapshot.val();

          setCurrentUserRole(currentUserData.role);
        }
      }
    };
    fetchAdmins();
  }, []);

  useEffect(() => {
    const adminsRef = ref(database, "admins");

    const handleChildAddedOrChanged = async (snapshot) => {
      const data = snapshot.val();
      const feedbackRef = ref(database, `feedback/${data.uid}`);
      const feedbackSnapshot = await get(feedbackRef);
      const feedbacks = feedbackSnapshot.exists()
        ? Object.values(feedbackSnapshot.val())
        : [];
      const feedbackText = feedbacks.map((fb) => fb.feedback).join(", ");

      setAdmins((prevAdmins) => {
        const existingIndex = prevAdmins.findIndex(
          (item) => item.id === snapshot.key
        );
        if (existingIndex !== -1) {
          const updatedAdmins = [...prevAdmins];
          updatedAdmins[existingIndex] = {
            id: snapshot.key,
            ...data,
            feedback: feedbackText,
          };
          return updatedAdmins;
        } else {
          return [
            ...prevAdmins,
            { id: snapshot.key, ...data, feedback: feedbackText },
          ];
        }
      });
    };

    const handleChildRemoved = (snapshot) => {
      setAdmins((prevAdmins) =>
        prevAdmins.filter((item) => item.id !== snapshot.key)
      );
    };

    const childAddedListener = onChildAdded(
      adminsRef,
      handleChildAddedOrChanged
    );
    const childChangedListener = onChildChanged(
      adminsRef,
      handleChildAddedOrChanged
    );
    const childRemovedListener = onChildRemoved(adminsRef, handleChildRemoved);

    return () => {
      off(adminsRef, "child_added", childAddedListener);
      off(adminsRef, "child_changed", childChangedListener);
      off(adminsRef, "child_removed", childRemovedListener);
    };
  }, []);

  const handleDelete = async (id) => {
    try {
      await remove(ref(database, `admins/${id}`));
      setAdmins(admins.filter((admin) => admin.id !== id));
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  const handleChat = (id) => {
    setSelectedAdminId(id);
    setOpenChatDialog(true);
  };

  const handleDialogOpen = () => {
    setOpenDialog(true);
    setFormData({ name: "", email: "", password: "", role: "admin" });
    setError("");
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleFormSubmit = async () => {
    try {
      const roleMailRef = ref(database, "rolemail");
      const roleMailSnapshot = await get(roleMailRef);
      const roleMailData = roleMailSnapshot.exists()
        ? roleMailSnapshot.val()
        : {};

      // Check if the email is already in use
      if (
        Object.values(roleMailData).some(
          (entry) => entry.email === formData.email
        )
      ) {
        setError("Email already in use");
        return;
      }

      // Create the user with email and password in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Add the new admin role and email to the rolemail ref
      await set(ref(database, `rolemail/${user.uid}`), {
        email: formData.email,
        role: formData.role,
      });

      // Add the new admin data to the admins ref
      await set(ref(database, `admins/${user.uid}`), {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      // Close the dialog and reset the form
      handleDialogClose();
    } catch (error) {
      console.error("Error adding admin:", error);
      setError("Failed to add admin. Please try again.");
    }
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
          <>
            <IconButton
              color="secondary"
              sx={{ marginRight: 1, color: colors.redAccent[600] }}
              onClick={() => handleDelete(params.id)}
            >
              <DeleteIcon />
            </IconButton>
          </>
        </>
      ),
    },
    {
      field: "chat",
      headerName: "Chat",
      flex: 0.5,
      renderCell: (params) => (
        <>
          <IconButton
            color="primary"
            sx={{ color: "#ffffff" }}
            onClick={() => handleChat(params.id)}
          >
            <ChatIcon />
          </IconButton>
        </>
      ),
    },
  ];
  const handleSendMessage = async () => {
    if (chatMessage.trim() === "") return;

    const newMessageRef = ref(
      database,
      `messages/${selectedAdminId}/${Date.now()}`
    );
    await set(newMessageRef, {
      message: chatMessage,
      timestamp: Date.now(),
      sender: "superadmin",
    });

    setChatMessage("");
    setOpenChatDialog(false);
  };
  return (
    <Box m="20px">
      <Header title="ADMINS" subtitle="List of Admins" />
      <Button
        variant="contained"
        color="primary"
        onClick={handleDialogOpen}
        sx={{
          display: "inline-flex",
          height: "48px",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",

          border: `2px solid ${colors.tealAccent[600]}`,
          boxShadow: `0 0 10px ${colors.tealAccent[600]}`,
          background: "linear-gradient(110deg,#000103 45%,#1e2631 55%,#000103)",
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
        Add Admin
      </Button>
      <Box
        m="10px 0 0 0"
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
          sx={{
            border: `20px solid ${colors.tealAccent[600]}`,
            boxShadow: `0 0 10px ${colors.tealAccent[600]}`,
          }}
        />
      </Box>
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle
          sx={{ backgroundColor: "#000000", color: colors.yellowAccent[600] }}
        >
          Add Admin
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#000000" }}>
          {error && <Box sx={{ color: "red", marginBottom: 2 }}>{error}</Box>}
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
          <TextField
            margin="dense"
            label="Role"
            type="text"
            fullWidth
            disabled
            variant="outlined"
            value={"admin"}
            sx={{
              marginBottom: "10px",
              boxShadow:
                "0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)",
              "&:hover": {
                boxShadow: "0px 0px 8px 2px rgba(33,150,243,0.5)",
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#000000" }}>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleFormSubmit} color="info">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openChatDialog} onClose={() => setOpenChatDialog(false)}>
        <DialogTitle
          sx={{ backgroundColor: "#000000", color: colors.yellowAccent[600] }}
        >
          Send Message
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#000000" }}>
          <TextField
            margin="dense"
            label="Message"
            fullWidth
            variant="outlined"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            sx={{
              marginBottom: "10px",
              boxShadow:
                "0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)",
              "&:hover": {
                boxShadow: "0px 0px 8px 2px rgba(33,150,243,0.5)",
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#000000" }}>
          <Button onClick={() => setOpenChatDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSendMessage} color="info">
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminList;
