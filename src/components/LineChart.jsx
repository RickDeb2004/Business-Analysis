import { ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { auth } from "../firebase";

const LineChart = ({ isCustomLineColors = false, isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) {
        console.error("User is not authenticated");
        return;
      }
      const db = getDatabase();
      const dataRef = ref(db, `users/${auth.currentUser.uid}/formData/salesPerMonth`);
      const snapshot = await get(dataRef);

      if (snapshot.exists()) {
        const firebaseData = snapshot.val();
        const formattedData = formatData(firebaseData);
        setData(formattedData);
      } else {
        console.log("No data available");
      }
    };

    fetchData();
  }, []);

  const formatData = (firebaseData) => {
    const dataByCountry = {};

    Object.values(firebaseData).forEach(item => {
      if (!dataByCountry[item.country]) {
        dataByCountry[item.country] = [];
      }
      dataByCountry[item.country].push({
        x: item.month,
        y: item.amount
      });
    });

    const result = Object.keys(dataByCountry).map((country, index) => ({
      id: country,
      color: theme.palette.type === 'dark' ? colors[index % colors.length] : `hsl(${(index * 360) / Object.keys(dataByCountry).length}, 70%, 50%)`,
      data: dataByCountry[country]
    }));

    return result;
  };

  if (data.length === 0) {
    return <div>Loading...</div>; 
  }

  return (
    <ResponsiveLine
      data={data}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
        tooltip: {
          container: {
            color: colors.primary[500],
          },
        },
      }}
      colors={isDashboard ? { datum: "color" } : { scheme: "nivo" }}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: true,
        reverse: false,
      }}
      yFormat=" >-.2f"
      curve="catmullRom"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "Month",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        orient: "left",
        tickValues: 5,
        tickSize: 3,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "Sales Amount",
        legendOffset: -40,
        legendPosition: "middle",
      }}
      enableGridX={false}
      enableGridY={false}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  );
};

export default LineChart;
