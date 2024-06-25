import React, { useState, useEffect } from 'react';
import { Box, TextField, IconButton, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { ref, onValue, push, set, serverTimestamp } from "firebase/database";
import { auth, database } from '../firebase';
import { useTheme } from "@mui/material";
import { tokens } from '../theme';
import { useParams, useNavigate } from 'react-router-dom';

const Chat = () => {
  const { chatUserId } = useParams();  // Get the chat user ID from URL params
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      // If the user is not authenticated, navigate to login page
      navigate("/");
      return;
    }

    const currentUserId = currentUser.uid;
    const chatRef = ref(database, `chats/${currentUserId}_${chatUserId}`);

    const messagesRef = ref(database, `chats/${currentUserId}_${chatUserId}/messages`);
    const typingRef = ref(database, `chats/${chatUserId}/typing`);
    const onlineRef = ref(database, `chats/${chatUserId}/online`);

    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMessages(Object.values(data));
      }
    });

    onValue(typingRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data !== currentUserId) {
        setTypingStatus("typing...");
      } else {
        setTypingStatus("");
      }
    });

    onValue(onlineRef, (snapshot) => {
      const data = snapshot.val();
      setIsOnline(data === true);
    });

    const userOnlineRef = ref(database, `chats/${currentUserId}/online`);
    const handleOnlineStatus = async () => {
      await set(userOnlineRef, true);
    };

    handleOnlineStatus();

    return async () => {
      await set(userOnlineRef, false);
    };
  }, [chatUserId, navigate]);

  const handleSendMessage = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    const currentUserId = currentUser.uid;

    if (message.trim() === "") return;

    const newMessageRef = push(ref(database, `chats/${currentUserId}_${chatUserId}/messages`));
    await set(newMessageRef, {
      sender: currentUserId,
      content: message,
      timestamp: serverTimestamp(),
    });

    setMessage("");
  };

  const handleTyping = async (e) => {
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    const currentUserId = currentUser.uid;

    setMessage(e.target.value);
    const typingRef = ref(database, `chats/${currentUserId}/typing`);
    await set(typingRef, currentUserId);

    setTimeout(async () => {
      await set(typingRef, null);
    }, 2000);
  };

  return (
    <Box m="20px">
      <Typography variant="h4" color={colors.grey[100]}>
        Chat with Admin
      </Typography>
      <Box
        display="flex"
        flexDirection="column"
        height="70vh"
        overflow="auto"
        bgcolor={colors.primary[400]}
        p="20px"
        borderRadius="8px"
      >
        {messages.map((msg, index) => (
          <Box key={index} mb="10px" alignSelf={msg.sender === auth.currentUser.uid ? "flex-end" : "flex-start"}>
            <Typography color={colors.grey[100]}>{msg.content}</Typography>
          </Box>
        ))}
      </Box>
      <Typography color={colors.greenAccent[500]}>{typingStatus}</Typography>
      <Typography color={isOnline ? colors.greenAccent[500] : colors.grey[500]}>
        {isOnline ? "Online" : "Offline"}
      </Typography>
      <Box display="flex" mt="10px">
        <TextField
          variant="outlined"
          fullWidth
          value={message}
          onChange={handleTyping}
          placeholder="Type a message..."
          sx={{ bgcolor: colors.primary[400], borderRadius: '8px', mr: "10px" }}
        />
        <IconButton onClick={handleSendMessage} color="primary">
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chat;
