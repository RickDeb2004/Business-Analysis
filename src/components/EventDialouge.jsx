import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  useTheme,
} from "@mui/material";
import { tokens } from "../theme";

const EventDialog = ({ open, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleSave = () => {
    onSave(title);
    setTitle("");
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
    <Dialog
      open={open}
      onClose={onClose}
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
        sx={{
          backgroundColor: "#000000",
          color: colors.yellowAccent[600],
          borderBottom: `1px solid ${colors.tealAccent[600]}`,
        }}
      >
        Add Event
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: "#000000",
          color: colors.grey[100],
        }}
      >
        <TextField
          autoFocus
          margin="dense"
          label="Event Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{
            backgroundColor: "#000000",
            "& .MuiInputBase-root": { color: colors.grey[100] },
            "& .MuiInputLabel-root": { color: colors.yellowAccent[600] },
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: colors.tealAccent[600] },
              "&:hover fieldset": { borderColor: colors.yellowAccent[600] },
              "&.Mui-focused fieldset": { borderColor: colors.tealAccent[600] },
            },
          }}
        />
      </DialogContent>
      <DialogActions
        sx={{
          backgroundColor: "#000000",
          borderTop: `1px solid ${colors.tealAccent[600]}`,
        }}
      >
        <Button onClick={onClose} sx={{ color: colors.tealAccent[600] }}>
          Cancel
        </Button>
        <Button onClick={handleSave} sx={{ color: colors.tealAccent[600] }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventDialog;
