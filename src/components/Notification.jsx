import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  InputBase,
  Button,
  useTheme,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { database, auth } from "../firebase";
import { ref, get, remove, push, onChildAdded, off } from "firebase/database";
import { useParams } from "react-router-dom";
import { tokens } from "../theme";

const Notifications = () => {
  const { id: selectedAdminId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const chatId = selectedAdminId || user.uid;
    const messagesRef = ref(database, `chats/${chatId}`);
    const fetchMessages = async () => {
      const snapshot = await get(messagesRef);
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const allMessages = Object.entries(messagesData).map(([msgId, message]) => ({
          ...message,
          msgId,
        }));
        setMessages(allMessages);
      }
    };
    fetchMessages();

    const handleNewMessage = (snapshot) => {
      const message = snapshot.val();
      setMessages((prevMessages) => [...prevMessages, { ...message, msgId: snapshot.key }]);
    };

    onChildAdded(messagesRef, handleNewMessage);

    return () => {
      off(messagesRef, 'child_added', handleNewMessage);
    };
  }, [user, selectedAdminId]);

  const handleSend = async () => {
    if (newMessage.trim() === "" || !user) return;
    const chatId = selectedAdminId || user.uid;
    const messageRef = ref(database, `chats/${chatId}`);
    await push(messageRef, {
      message: newMessage,
      timestamp: Date.now(),
      sentByMe: !selectedAdminId, // If selectedAdminId is present, it's sent by the superadmin
    });
    setNewMessage("");
  };

  const handleDelete = async (msgId) => {
    if (!user) return;
    const chatId = selectedAdminId || user.uid;
    const messageRef = ref(database, `chats/${chatId}/${msgId}`);
    await remove(messageRef);
    setMessages((prevMessages) => prevMessages.filter((msg) => msg.msgId !== msgId));
  };

  return (
    <Box p={2} height="100vh" display="flex" flexDirection="column">
      <Typography variant="h1" gutterBottom>Notifications</Typography>
      <Box sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column-reverse" }}>
        {messages.map((msg, index) => (
          <Box key={index} sx={{ display: "flex", flexDirection: msg.sentByMe ? "row-reverse" : "row", alignItems: "flex-start", marginBottom: "8px" }}>
            <Box sx={{ maxWidth: "65%", borderRadius: "8px", backgroundColor: `linear-gradient(135deg, ${colors.tealAccent[600]} 30%, ${colors.greenAccent[600]} 100%)`, padding: "8px", marginLeft: msg.sentByMe ? "auto" : "initial" }}>
              <Typography variant="body1">{msg.message}</Typography>
              <Typography variant="caption" color="textSecondary">{new Date(msg.timestamp).toLocaleString()}</Typography>
              <IconButton sx={{ marginLeft: "auto", padding: "4px" }} onClick={() => handleDelete(msg.msgId)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <InputBase sx={{ flex: 1, marginRight: "8px", padding: "8px", borderRadius: "8px", backgroundColor: `linear-gradient(135deg, ${colors.tealAccent[600]} 30%, ${colors.greenAccent[600]} 100%)` }} placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
        <Button variant="contained" onClick={handleSend}>Send</Button>
      </Box>
    </Box>
  );
};

export default Notifications;
