import React, { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { useTheme, Card, CardContent, Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const HoverEffect = ({ items }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const theme = useTheme();
  const colors = theme.palette;

  return (
    <Box
      sx={{
        backgroundColor: colors.background.default,
        p: 4,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
        gap: 4,
      }}
    >
      {items.map((item, idx) => (
        <Link
          href={item.link}
          key={item.link}
          style={{ position: 'relative', display: 'block', height: '100%', width: '100%' }}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                style={{
                  position: 'absolute',
                  inset: 0,
                  height: '100%',
                  width: '100%',
                  backgroundColor: colors.grey[200],
                  opacity: 0,
                  zIndex: 1,
                }}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <TodoCard title={item.title} description={item.description} />
        </Link>
      ))}
    </Box>
  );
};

const TodoCard = ({ title, description }) => {
  const theme = useTheme();
  const colors = theme.palette;

  return (
    <Card
      sx={{
        height: '100%',
        width: '100%',
        p: 2,
        overflow: 'hidden',
        backgroundColor: colors.background.paper,
        borderColor: 'transparent',
        borderRadius: '12px',
        '&:hover': {
          borderColor: colors.grey[700],
        },
      }}
    >
      <CardContent>
        <Typography variant="h5" component="div" sx={{ color: colors.text.primary }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.text.secondary, mt: 2 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default HoverEffect;
