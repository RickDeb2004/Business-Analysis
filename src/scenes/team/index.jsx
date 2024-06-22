import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";
import { useEffect, useState } from "react";
import { database } from "../../firebase";
import { off, onChildAdded, onChildChanged, onChildRemoved, ref, get, remove } from "firebase/database";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [userData, setUserData] = useState([]);
  const columns = [
    { field: "id", headerName: "Sl No." },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "email",
      headerName: "Email",
      type: "text",
      headerAlign: "left",
      align: "left",
      flex: 1,
    },
    {
      field: "signInTime",
      headerName: "Login Time",
      flex: 1,
    },
    {
      field: "signOutTime",
      headerName: "Logout Time",
      flex: 1,
      valueGetter: (params) => params.row.signOutTime || "-",
    },
    {
      field: "role",
      headerName: "Access Level",
      flex: 1,
      renderCell: ({ row: { role } }) => {
        return (
          <Box
            width="60%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={
              role === "admin"
                ? colors.greenAccent[600]
                : role === "manager"
                ? colors.greenAccent[700]
                : colors.greenAccent[700]
            }
            borderRadius="4px"
          >
            {role === "admin" && <AdminPanelSettingsOutlinedIcon />}
            {role === "manager" && <SecurityOutlinedIcon />}
            {role === "user" && <LockOpenOutlinedIcon />}
            <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
              {role}
            </Typography>
          </Box>
        );
      },
    },
  ];

  useEffect(() => {
    const userActivityRef = ref(database, "userActivity");

    // Function to add or update user data
    const handleChildAddedOrChanged = (snapshot) => {
      const data = snapshot.val();
      setUserData((prevUserData) => {
        const existingIndex = prevUserData.findIndex((item) => item.id === snapshot.key);
        if (existingIndex !== -1) {
          const updatedUserData = [...prevUserData];
          updatedUserData[existingIndex] = { id: snapshot.key, ...data };
          return updatedUserData;
        } else {
          return [...prevUserData, { id: snapshot.key, ...data }];
        }
      });
    };

    // Function to remove user data
    const handleChildRemoved = (snapshot) => {
      setUserData((prevUserData) => prevUserData.filter((item) => item.id !== snapshot.key));
    };

    // Attach listeners
    const childAddedListener = onChildAdded(userActivityRef, handleChildAddedOrChanged);
    const childChangedListener = onChildChanged(userActivityRef, handleChildAddedOrChanged);
    const childRemovedListener = onChildRemoved(userActivityRef, handleChildRemoved);

    // Cleanup listeners on unmount
    return () => {
      off(userActivityRef, 'child_added', childAddedListener);
      off(userActivityRef, 'child_changed', childChangedListener);
      off(userActivityRef, 'child_removed', childRemovedListener);
    };
  }, []);

  useEffect(() => {
    // Function to check and remove old user activities
    const cleanupOldActivities = async () => {
      const userActivityRef = ref(database, "userActivity");
      const snapshot = await get(userActivityRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const now = new Date().getTime();
        const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        for (let key in data) {
          const activity = data[key];
          const signInTime = new Date(activity.signInTime).getTime();

          if (now - signInTime > oneDay) {
            const activityRef = ref(database, `userActivity/${key}`);
            await remove(activityRef);
          }
        }
      }
    };

    // Run the cleanup function immediately and set interval for 24 hours
    cleanupOldActivities();
    const interval = setInterval(cleanupOldActivities, 24 * 60 * 60 * 1000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <Box m="20px">
      <Header title="TEAM" subtitle="Managing the Team Members" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid checkboxSelection rows={userData} columns={columns} />
      </Box>
    </Box>
  );
};

export default Team;
