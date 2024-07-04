import {
  Box,
  Button,
  TextareaAutosize,
  Typography,
  Avatar,
  Card,
  useTheme,
} from "@mui/material";
import { getAuth } from "firebase/auth";
import { get, ref, update, onValue } from "firebase/database";
import { useEffect, useState } from "react";
import { database } from "../../firebase";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import TypewriterEffectSmooth from "../../components/TypeWriterEffect";

const Feedback = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [feedback, setFeedback] = useState("");
  const [userFeedbacks, setUserFeedbacks] = useState([]);
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    const fetchUserFeedbacks = () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const feedbackRef = ref(database, `admins/${user.uid}`);
        onValue(feedbackRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setUserFeedbacks(data.feedback || []);
            setUserInfo({
              name: data.name || "Anonymous",
              email: data.email,
              role: data.role,
            });
          }
        });
      }
    };

    fetchUserFeedbacks();
  }, []);

  const handleSubmit = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const feedbackRef = ref(database, `admins/${user.uid}`);
      const snapshot = await get(feedbackRef);
      if (snapshot.exists()) {
        const adminData = snapshot.val();
        const newFeedback = [...(adminData.feedback || []), feedback];
        await update(feedbackRef, {
          feedback: newFeedback,
        });
        setFeedback("");
      }
    }
  };

  return (
    <Box m="20px">
      <Header
        title={
          <TypewriterEffectSmooth
            words={[{ text: "Feed Back", className: "text-blue-500" }]}
          />
        }
        subtitle="Every improvement starts with a feedback"
      />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="70vh"
        bgcolor={colors.primary[400]}
        borderRadius="8px"
        p="20px"
        mb="20px"
        sx={{
          border: `2px solid ${colors.grey[600]}`,
          boxShadow: `0 0 10px ${colors.grey[600]}`,
          "@media (prefers-color-scheme: dark)": {
            bgcolor: "#18181b", // Equivalent to dark:bg-zinc-900
          },
        }}
      >
        <TextareaAutosize
          aria-label="minimum height"
          minRows={15}
          placeholder="Enter your feedback here"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          style={{
            width: "70%",
            padding: "10px",
            borderRadius: "4px",
            backgroundColor: "transparent",
            border: `1px solid ${colors.grey[100]}`,
            color: colors.grey[100],
            outline: "none",
            transition: "border-color 0.3s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "cyan")}
          onBlur={(e) => (e.target.style.borderColor = colors.grey[100])}
        />
        <Button
          onClick={handleSubmit}
          sx={{
            marginTop: "20px",
            backgroundColor: colors.blueAccent[700],
            color: colors.grey[100],
            fontSize: "14px",
            fontWeight: "bold",
            padding: "10px 20px",
            "&:hover": {
              backgroundColor: colors.blueAccent[800],
            },
          }}
        >
          Submit
        </Button>
      </Box>
      <Box mt="20px">
        <Typography variant="h4" mb="20px">
          Previous Feedback
        </Typography>
        {userFeedbacks.map((feedback, index) => (
          <Card
            key={index}
            sx={{
              p: "20px",
              mb: "20px",
              width: "100%",
              backgroundColor: `linear-gradient(135deg, ${colors.tealAccent[600]} 30%, ${colors.greenAccent[600]} 100%)`,
              color: colors.grey[100],
              borderRadius: "8px",
              boxShadow: `0 0 10px ${colors.tealAccent[600]}`,
              border: `2px solid ${colors.tealAccent[600]}`,
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "scale(1.01)",
                boxShadow: `0 0 20px ${colors.tealAccent[600]}`,
              },
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box display="flex" alignItems="center">
                <Avatar sx={{ width: 40, height: 40, mr: 2 }}>
                  {userInfo.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body1">{userInfo.name}</Typography>
                  <Typography variant="body2" color={colors.grey[500]}>
                    {userInfo.email}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2">{userInfo.role}</Typography>
            </Box>
            <Typography variant="body2" mt="10px" color={colors.grey[100]}>
              {feedback}
            </Typography>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default Feedback;
