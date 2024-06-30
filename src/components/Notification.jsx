import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  useTheme,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { database } from "../firebase";
import { ref, get, remove } from "firebase/database";
import { tokens } from "../theme";

const Notifications = () => {
  const [messages, setMessages] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const fetchMessages = async () => {
      const messagesRef = ref(database, "messages");
      const snapshot = await get(messagesRef);
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const allMessages = Object.entries(messagesData).flatMap(
          ([userId, userMessages]) =>
            Object.entries(userMessages).map(([msgId, message]) => ({
              ...message,
              msgId,
              userId,
            }))
        );
        setMessages(allMessages);
      }
    };

    fetchMessages();
  }, []);

  const handleDelete = async (userId, msgId) => {
    const messageRef = ref(database, `messages/${userId}/${msgId}`);
    try {
      await remove(messageRef);
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.msgId !== msgId)
      );
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h1" gutterBottom>
        Notifications
      </Typography>
      <Grid container spacing={2}>
        {messages.map((msg, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card
              sx={{
                boxShadow: `0 0 10px ${colors.tealAccent[600]}`,
                border: `2px solid ${colors.tealAccent[600]}`,
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Box>
                    <Typography variant="body1" component="p">
                      {msg.message}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Sent by: {msg.sender}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(msg.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                  <IconButton
                    color={colors.redAccent[600]}
                    onClick={() => handleDelete(msg.userId, msg.msgId)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Notifications;
