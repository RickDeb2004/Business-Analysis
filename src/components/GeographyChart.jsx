import { useTheme } from "@mui/material";
import { ResponsiveChoropleth } from "@nivo/geo";
import { geoFeatures } from "../data/mockGeoFeatures";
import { tokens } from "../theme";

const GeographyChart = ({ locations }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  if (!locations) {
    return null; // or you can return a placeholder or loading indicator
  }

  // Create data array for the chart
  const data = Object.entries(locations).flatMap(([userId, user]) =>
    user.formData.locations.map((location, index) => ({
      id: `${userId}-${index}`, // Generate a unique ID for each location using userId
      value: 1, // You can set a constant value or calculate based on the number of occurrences
      location: location, // Assuming location is an object with name and other properties
    }))
  );

  return (
    <ResponsiveChoropleth
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
      }}
      features={geoFeatures.features}
      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      domain={[0, 1000000]}
      unknownColor="#666666"
      label="properties.name"
      valueFormat=".2s"
      projectionScale={150}
      projectionTranslation={[0.5, 0.5]}
      projectionRotation={[0, 0, 0]}
      borderWidth={1.5}
      borderColor="#ffffff"
    />
  );
};

export default GeographyChart;
