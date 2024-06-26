import React from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";

const GradientBox = ({ children, ...props }) => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };

  const gradientStyle = {
    position: "absolute",
    inset: 0,
    borderRadius: "24px",
    zIndex: 1,
    opacity: 0.6,
    transition: "opacity 0.5s",
    background: `radial-gradient(circle_farthest-side_at_0_100%,#00ccb1,transparent),
                 radial-gradient(circle_farthest-side_at_100%_0,#7b61ff,transparent),
                 radial-gradient(circle_farthest-side_at_100%_100%,#ffc414,transparent),
                 radial-gradient(circle_farthest-side_at_0_0,#1ca0fb,#141316)`,
    backgroundSize: "400% 400%",
  };

  return (
    <Box position="relative" {...props}>
      <motion.div
        variants={variants}
        initial="initial"
        animate="animate"
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        style={gradientStyle}
      />
      <Box position="relative" zIndex={2} p="16px" borderRadius="24px">
        {children}
      </Box>
    </Box>
  );
};

export default GradientBox;
