import { Box, CircularProgress, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import GeographyChart from "../../components/GeographyChart";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { database, auth } from "../../firebase";
import {ref, get } from 'firebase/database';

const Geography = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {

        if (!auth.currentUser) {
          console.error("User is not authenticated");
          return;
        }
        // Fetch locations data from Firebase Realtime Database for current user
        const db = database;
        const dataRef = ref(db, `users/${auth.currentUser.uid}/formData/salesPerUnit`);
        const snapshot = await get(dataRef);

        if (snapshot.exists()) {
          const firebaseData = snapshot.val();
          // console.log(firebaseData)
          setLocations(firebaseData);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching locations:", error);
        // Handle the error here
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return (
    <Box m="20px">
      <Header title="Geography" subtitle="Simple Geography Chart" />

      {loading ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="75vh"
        >
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <>
          {locations.length > 0 ? (
            <Box
              height="75vh"
              border={`1px solid ${colors.grey[100]}`}
              borderRadius="4px"
            >
              <GeographyChart locationData={locations} />
            </Box>
          ) : (
            <Typography variant="body1" color="error">
              No location data available.
            </Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default Geography;
