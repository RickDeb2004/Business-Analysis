import { ResponsiveChoropleth } from "@nivo/geo";
import { geoFeatures } from "../data/mockGeoFeatures";

const GeographyChart = ({ locationData, isDashboard }) => {
  if (!locationData) {
    return null; // or you can return a placeholder or loading indicator
  }

  const data = locationData.map((data, index) => ({
    id: data.country, 
    value: data.unitSales,
  }));

  // Define the initial zoom level based on the `isDashboard` prop
  const initialZoom = isDashboard ? 1 : 2;

  return (
    <ResponsiveChoropleth
        data={data}
        features={geoFeatures.features}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        colors="nivo"
        domain={[ 0, 1000000 ]}
        unknownColor="#666666"
        label="properties.name"
        valueFormat=".2s"
        projectionTranslation={[ 0.5, 0.5 ]}
        projectionRotation={[ 0, 0, 0 ]}
        projectionScale={isDashboard ? 50 : 150}
        borderWidth={0.5}
        borderColor="#152538"
        isInteractive={true}
        enableZoom={true}
        legends={
          !isDashboard ? [
            {
                anchor: 'bottom-left',
                direction: 'column',
                justify: true,
                translateX: 20,
                translateY: 0,
                itemsSpacing: 0,
                itemWidth: 94,
                itemHeight: 18,
                itemDirection: 'left-to-right',
                itemTextColor: '#fff',
                itemOpacity: 0.85,
                symbolSize: 18,
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemTextColor: '#999999', 
                            itemOpacity: 1
                        }
                    }
                ]
            }
          ] : []
        }
        theme={{
          tooltip: {
            container: {
              color: "#000", 
            },
          },
        }}
        // Control zoom behavior with the initial zoom level
        zoom={initialZoom}
        maxZoom={8}
        minZoom={0.5}
    />
  );
};

export default GeographyChart;
