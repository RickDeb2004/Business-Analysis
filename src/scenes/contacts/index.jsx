import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  useTheme,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useEffect, useState } from "react";
import { getDatabase, ref, set, update, remove, get } from "firebase/database";
import { database } from "../../firebase";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import Delete from "@mui/icons-material/Delete";
const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [contacts, setContacts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [formData, setFormData] = useState({
    registrarId: "",
    name: "",
    age: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
  });

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "registrarId", headerName: "Registrar ID" },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "age", headerName: "Age", type: "number" },
    { field: "phone", headerName: "Phone Number", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "city", headerName: "City", flex: 1 },
    { field: "zipCode", headerName: "Zip Code", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: ({ row }) => (
        <Button
          onClick={() => handleEditContact(row)}
          sx={{ color: colors.grey[100] }}
        >
          Edit
        </Button>
      ),
    },
    {
      field: "delete",
      headerName: "Delete",
      flex: 1,
      renderCell: ({ row }) => (
        <Button
          onClick={() => handleDeleteContact(row)}
          sx={{ color: colors.redAccent[400] }}
        >
          <Delete />
        </Button>
      ),
    },
  ];

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const contactsRef = ref(database, "contacts");
        const snapshot = await get(contactsRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const contactsArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setContacts(contactsArray);
        } else {
          setContacts([]);
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };
    fetchContacts();
  }, []);

  const handleAddContact = () => {
    setFormData({
      registrarId: "",
      name: "",
      age: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      zipCode: "",
    });
    setSelectedContact(null);
    setOpenDialog(true);
  };

  const handleEditContact = (contact) => {
    setSelectedContact(contact);
    setFormData({ ...contact });
    setOpenDialog(true);
  };

  const handleDeleteContact = async (contact) => {
    try {
      const contactRef = ref(database, `contacts/${contact.id}`);
      await remove(contactRef);
      setContacts((prevContacts) =>
        prevContacts.filter((c) => c.id !== contact.id)
      );
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedContact(null);
    setFormData({
      registrarId: "",
      name: "",
      age: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      zipCode: "",
    });
  };

  const handleFormSubmit = async () => {
    try {
      const contactData = {
        ...formData,
        id: selectedContact ? selectedContact.id : uuidv4(),
      };

      const contactRef = ref(database, `contacts/${contactData.id}`);
      if (selectedContact) {
        await update(contactRef, contactData);
        setContacts((prevContacts) =>
          prevContacts.map((c) => (c.id === contactData.id ? contactData : c))
        );
      } else {
        await set(contactRef, contactData);
        setContacts((prevContacts) => [...prevContacts, contactData]);
      }
      handleDialogClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  const lampEffectStyle = {
    position: "relative",
    background: "linear-gradient(to top, #00bfff, transparent)",
    "&::after": {
      content: '""',
      position: "absolute",
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
      <Header title="TEAM INFO" subtitle="List of Team's Information" />
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
          Add Information
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
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={contacts}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          getRowId={(row) => row.id}
          sx={{
            border: `20px solid ${colors.grey[600]}`,
            boxShadow: `0 0 10px ${colors.grey[600]}`,
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
          {selectedContact ? "Edit Contact" : "Add Contact"}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#000000" }}>
          <TextField
            margin="dense"
            label="Registrar ID"
            fullWidth
            variant="outlined"
            value={formData.registrarId}
            onChange={(e) =>
              setFormData({ ...formData, registrarId: e.target.value })
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
            label="Age"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
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
            label="Phone Number"
            fullWidth
            variant="outlined"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
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
            label="Address"
            fullWidth
            variant="outlined"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
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
            label="City"
            fullWidth
            variant="outlined"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
            label="Zip Code"
            fullWidth
            variant="outlined"
            value={formData.zipCode}
            onChange={(e) =>
              setFormData({ ...formData, zipCode: e.target.value })
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
        </DialogContent>
        <DialogActions sx={{ backgroundColor: "#000000" }}>
          <Button onClick={handleDialogClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleFormSubmit} color="info">
            {selectedContact ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Contacts;
