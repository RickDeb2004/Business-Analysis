import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,

  IconButton,

  Typography,
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
  push,
} from "firebase/database";
import { auth, database } from "../../firebase";
import Header from "../../components/Header";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";

import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";

const AdminList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [admins, setAdmins] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null);
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

  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {

    const fetchAdmins = async () => {
      const adminsRef = ref(database, "admins");
      const snapshot = await get(adminsRef);
      if (snapshot.exists()) {
        const users = snapshot.val();

        const adminsList = Object.keys(users).map((key) => ({

          id: key,
          ...users[key],
        }));

        // Fetch feedbacks and merge with admin data

        const updatedAdminsList = await Promise.all(
          adminsList.map(async (admin) => {
            const feedbackRef = ref(database, `admins/${admin.id}/feedback`);
            const feedbackSnapshot = await get(feedbackRef);
            let latestFeedback = "No feedback";
            if (feedbackSnapshot.exists()) {
              const feedbacks = Object.values(feedbackSnapshot.val());
              latestFeedback =
                feedbacks.length > 0 ? feedbacks[feedbacks.length - 1] : "No feedback";
            }
            return { ...admin, feedback: latestFeedback };
          })
        );

        setAdmins(updatedAdminsList);
      }

      // Get the current user's ID and role
      const auth = getAuth();
      const currentUserId = auth.currentUser.uid;
      const roleMailRef = ref(database, `rolemail/${currentUserId}`);
      const roleMailSnapshot = await get(roleMailRef);
      if (roleMailSnapshot.exists()) {
        const currentUserData = roleMailSnapshot.val();
        setCurrentUserRole(currentUserData.role);
      }
    };


    fetchAdmins();
  }, []);

  useEffect(() => {
    const adminsRef = ref(database, "admins");

    const handleChildAddedOrChanged = async (snapshot) => {
      const data = snapshot.val();
      const feedbackRef = ref(database, `admins/${snapshot.key}/feedback`);
      const feedbackSnapshot = await get(feedbackRef);

      let latestFeedback = "No feedback";
      if (feedbackSnapshot.exists()) {
        const feedbacks = Object.values(feedbackSnapshot.val());
        latestFeedback =
          feedbacks.length > 0 ? feedbacks[feedbacks.length - 1] : "No feedback";
      }


      setAdmins((prevAdmins) => {
        const existingIndex = prevAdmins.findIndex(
          (item) => item.id === snapshot.key
        );
        if (existingIndex !== -1) {
          const updatedAdmins = [...prevAdmins];
          updatedAdmins[existingIndex] = {
            id: snapshot.key,
            ...data,
            feedback: latestFeedback,
          };
          return updatedAdmins;
        } else {
          return [
            ...prevAdmins,
            { id: snapshot.key, ...data, feedback: latestFeedback },
          ];
        }
      });
    };

    const handleChildRemoved = (snapshot) => {
      setAdmins((prevAdmins) =>
        prevAdmins.filter((item) => item.id !== snapshot.key)
      );
    };

    onChildAdded(adminsRef, handleChildAddedOrChanged);
    onChildChanged(adminsRef, handleChildAddedOrChanged);
    onChildRemoved(adminsRef, handleChildRemoved);

    // Clean up listeners
    return () => {
      off(adminsRef, "child_added", handleChildAddedOrChanged);
      off(adminsRef, "child_changed", handleChildAddedOrChanged);
      off(adminsRef, "child_removed", handleChildRemoved);
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
  const fetchMessages = async (adminId) => {
    const messagesRef = ref(database, `chats/${adminId}`);
    const snapshot = await get(messagesRef);
    if (snapshot.exists()) {
      const messagesData = snapshot.val();
      const allMessages = Object.entries(messagesData).map(
        ([msgId, message]) => ({
          ...message,
          msgId,
        })
      );
      setMessages(allMessages);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "name", headerName: "Name", flex: 0.8 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "feedback", headerName: "Feedback", flex: 1.6 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <>
          <IconButton
            color="secondary"
            sx={{ marginRight: 1, color: colors.redAccent[600] }}
            onClick={() => handleDelete(params.id)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
    {
      field: "chat",
      headerName: "Chat",
      flex: 0.5,
      renderCell: (params) => (
        <>
          {currentUserRole === "superadmin" && (
            <IconButton
              color="primary"
              sx={{ color: "#ffffff" }}
              onClick={() => handleChat(params.id)}
            >
              <ChatIcon />
            </IconButton>
          )}
        </>
      ),
    },
  ];

  const handleSendMessage = async () => {
    if (chatMessage.trim() === "") return;
    const messageRef = ref(database, `chats/${selectedAdminId}`);
    await push(messageRef, {
      message: chatMessage,
      timestamp: Date.now(),
      sender: "superadmin",
    });
    setChatMessage("");
    fetchMessages(selectedAdminId);
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
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          fontSize: "1rem",
          border: `2px solid ${colors.tealAccent[600]}`,
          boxShadow: `0 0 10px ${colors.tealAccent[600]}`,
          background: "linear-gradient(110deg,#000103 45%,#1e2631 55%,#000103)",
          backgroundSize: "200% 100%",
          px: 2,
          color: "#9CA3AF",
          fontWeight: "500",
          textTransform: "none",
          animation: "shimmer 10s infinite",
          transition: "color 1s",
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
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Add Admin</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
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
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          {error && (
            <Box mt={2}>
              <Typography color="error">{error}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleFormSubmit} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog open={openChatDialog} onClose={() => setOpenChatDialog(false)}>
        <DialogTitle
          sx={{ backgroundColor: "#000000", color: colors.yellowAccent[600] }}
        >
          Chat with Admin
        </DialogTitle>
        <DialogContent dividers sx={{ backgroundColor: "#000000" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              overflowY: "auto",
              maxHeight: "400px",
            }}
          >
            {messages.map((msg) => (
              <Box
                key={msg.msgId}
                sx={{
                  alignSelf:
                    msg.sender === "superadmin" ? "flex-end" : "flex-start",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    background:
                      msg.sender === "superadmin"
                        ? colors.tealAccent[700]
                        : colors.primary[400],
                    padding: "8px 12px",
                    borderRadius: "4px",
                    color: "#ffffff",
                  }}
                >
                  {msg.message}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            backgroundColor: "#000000",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <TextField
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Type a message"
            fullWidth
            variant="outlined"
            size="small"
            sx={{
              marginBottom: "10px",
              boxShadow:
                "0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)",
              "&:hover": {
                boxShadow: "0px 0px 8px 2px rgba(33,150,243,0.5)",
              },
            }}
          />
          <IconButton onClick={handleSendMessage} color="info" variant="contained">
            <SendIcon />
          </IconButton>

        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminList;
