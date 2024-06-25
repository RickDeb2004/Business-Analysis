import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useEffect, useState } from "react";
import { database } from "../../firebase";
import { ref, set, update, remove, push ,get} from "firebase/database";
import { v4 as uuidv4 } from "uuid";

const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [contacts, setContacts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
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
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "age",
      headerName: "Age",
      type: "number",
      headerAlign: "left",
      align: "left",
    },
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
        <Button onClick={() => handleEditContact(row)} sx={{ color: colors.grey[100] }}>Edit</Button>
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const contactsRef = ref(database, "contacts");
      const snapshot = await get(contactsRef);
      if (snapshot.exists()) {
        setContacts(Object.values(snapshot.val()));
      }
    };
    fetchData();
  }, []);

  const handleAddContact = () => {
    setFormData({
      id: "",
      registrarId: "",
      name: "",
      age: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      zipCode: "",
    });
    setOpenDialog(true);
  };

  const handleEditContact = (contact) => {
    setSelectedContact(contact);
    setFormData({ ...contact });
    setOpenDialog(true);
  };

  const handleDeleteContact = async (id) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      const contactRef = ref(database, `contacts/${id}`);
      await remove(contactRef);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedContact(null);
    setFormData({
      id: "",
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
    const contactData = { ...formData };
    if (selectedContact) {
      const contactRef = ref(database, `contacts/${selectedContact.id}`);
      await update(contactRef, contactData);
    } else {
      const newContactId = uuidv4();
      const newContactRef = ref(database, `contacts/${newContactId}`);
      await set(newContactRef, contactData);
    }
    handleDialogClose();
  };

  return (
    <Box m="20px">
      <Header
        title="CONTACTS"
        subtitle="List of Contacts for Future Reference"
      />
      <Button
        onClick={handleAddContact}
        variant="contained"
        color="primary"
        sx={{ marginBottom: "20px" }}
      >
        Add Contact
      </Button>
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
        />
      </Box>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>
          {selectedContact ? "Edit Contact" : "Add Contact"}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Registrar ID"
            fullWidth
            variant="outlined"
            value={formData.registrarId}
            onChange={(e) =>
              setFormData({ ...formData, registrarId: e.target.value })
            }
          />
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
            label="Age"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
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
            label="Address"
            fullWidth
            variant="outlined"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="City"
            fullWidth
            variant="outlined"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleFormSubmit} color="primary">
            {selectedContact ? "Save" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Contacts;
