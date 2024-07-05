import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  InputBase,
  Button,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { database, auth } from "../firebase";
import { ref, get, remove, push, onChildAdded, off } from "firebase/database";

const Notifications = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);

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

    const messagesRef = ref(database, `chats/${user.uid}`);
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
  }, [user]);

  const handleSend = async () => {
    if (newMessage.trim() === "" || !user) return;
    const messageRef = ref(database, `chats/${user.uid}`);
    await push(messageRef, {
      message: newMessage,
      timestamp: Date.now(),
      sentByMe: true,
    });
    setNewMessage("");
  };

  const handleDelete = async (msgId) => {
    if (!user) return;
    const messageRef = ref(database, `chats/${user.uid}/${msgId}`);
    await remove(messageRef);
    setMessages((prevMessages) => prevMessages.filter((msg) => msg.msgId !== msgId));
  };

  return (
    <Box p={2} height="100vh" display="flex" flexDirection="column">
      <Typography variant="h1" gutterBottom>Notifications</Typography>
      <Box sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column-reverse" }}>
        {messages.map((msg, index) => (
          <Box key={index} sx={{ display: "flex", flexDirection: msg.sentByMe ? "row-reverse" : "row", alignItems: "flex-start", marginBottom: "8px" }}>
            <Box sx={{ maxWidth: "65%", borderRadius: "8px", backgroundColor: msg.sentByMe ? "#DCF8C6" : "#EAEAEA", padding: "8px", marginLeft: msg.sentByMe ? "auto" : "initial" }}>
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
        <InputBase sx={{ flex: 1, marginRight: "8px", padding: "8px", borderRadius: "8px", backgroundColor: "#F0F0F0" }} placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
        <Button variant="contained" onClick={handleSend}>Send</Button>
      </Box>
    </Box>
  );
};

export default Notifications;
