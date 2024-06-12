import { Box, CircularProgress, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import GeographyChart from "../../components/GeographyChart";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { database } from "../../firebase"; // Import Firebase database service

const Geography = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // Fetch locations data from Firebase Realtime Database
        const snapshot = await database.ref("users").once("value");
        const users = snapshot.val();
        const allLocations = [];

        // Extract locations from user data
        if (users) {
          Object.values(users).forEach((user) => {
            if (user.formData && user.formData.locations) {
              user.formData.locations.forEach((location) => {
                allLocations.push(location);
              });
            }
          });
        }

        // Set the locations state and mark loading as false
        setLocations(allLocations);
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
              <GeographyChart locations={locations} />
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
