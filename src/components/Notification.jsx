import React, { useEffect, useState } from 'react';
import { socket } from './socket'; // Adjust the path to where your socket.js is located
import { Avatar, Box, Button, Input, Typography } from '@mui/material';
import { useTheme } from '@mui/system';
import { Send, Phone, VideoCall, MoreHoriz } from '@mui/icons-material';
import { tokens } from '../theme';

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('message');
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message) {
      socket.emit('message', message);
      setMessage('');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar src="/placeholder-user.jpg" />
          <Box>
            <Typography variant="subtitle1">John Doe</Typography>
            <Typography variant="caption" color="textSecondary">
              Online
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button variant="outlined" size="small">
            <Phone fontSize="small" />
          </Button>
          <Button variant="outlined" size="small">
            <VideoCall fontSize="small" />
          </Button>
          <Button variant="outlined" size="small">
            <MoreHoriz fontSize="small" />
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
        }}
      >
        {messages.map((msg, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: '65%',
              bgcolor: index % 2 === 0 ? 'grey.300' : 'primary.main',
              color: index % 2 === 0 ? 'text.primary' : 'primary.contrastText',
              p: 1.5,
              borderRadius: 2,
              alignSelf: index % 2 === 0 ? 'flex-start' : 'flex-end',
              mb: 1,
            }}
          >
            <Typography variant="body2">{msg}</Typography>
            <Typography variant="caption" sx={{ alignSelf: 'flex-end' }}>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box
        component="form"
        onSubmit={sendMessage}
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          p: 2,
        }}
      >
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          sx={{ flex: 1, mr: 1 }}
          autoComplete="off"
        />
        <Button type="submit" variant="contained" color="primary">
          <Send />
        </Button>
      </Box>
    </Box>
  );
};

export default ChatComponent;
