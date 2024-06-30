import React from 'react';
import HoverEffect from './HoverEffect';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

const items = [
  { title: 'Task 1', description: 'Description for task 1', link: '/task1' },
  { title: 'Task 2', description: 'Description for task 2', link: '/task2' },
  { title: 'Task 3', description: 'Description for task 3', link: '/task3' },
  // Add more items as needed
];

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1c1c1c',
      paper: '#2c2c2c',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#a0a0a0',
    },
  },
});

const Page = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', p: 4 }}>
        <HoverEffect items={items} />
      </Box>
    </ThemeProvider>
  );
};

export default Page;
