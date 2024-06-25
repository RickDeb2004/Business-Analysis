import { useState, useEffect } from "react";
import { ResponsiveChoropleth } from "@nivo/geo";
import { geoFeatures } from "../data/mockGeoFeatures";
import { Button } from "@mui/material";

const GeographyChart = ({ locationData, isDashboard }) => {
  // State for managing zoom level and projection translation
  const [zoom, setZoom] = useState(isDashboard ? 0.5 : 2);
  const [translation, setTranslation] = useState([0.5, 0.5]);

  useEffect(() => {
    // Set initial values based on isDashboard prop
    setZoom(isDashboard ? 0.45 : 1);
    setTranslation([0.5, 0.6]);
  }, [isDashboard]);

  if (!locationData) {
    return null; // or you can return a placeholder or loading indicator
  }

  const data = locationData.map((data, index) => ({
    id: data.country,
    value: data.unitSales,
  }));

  // Handlers for zoom in and zoom out
  const handleZoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom * 1.2, 8));
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom / 1.5, 0.4));
  };

  // Handlers for panning
  const handlePan = (dx, dy) => {
    setTranslation((prevTranslation) => [
      Math.min(Math.max(prevTranslation[0] + dx, 0), 1),
      Math.min(Math.max(prevTranslation[1] + dy, 0), 1),
    ]);
  };

  return (
    <div style={{ height: "100%", position: "relative" }}>
      <ResponsiveChoropleth
        data={data}
        features={geoFeatures.features}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        colors="nivo"
        domain={[0, 1000000]}
        unknownColor="#666666"
        label="properties.name"
        valueFormat=".2s"
        projectionTranslation={translation}
        projectionRotation={[0, 0, 0]}
        projectionScale={150 * zoom}
        borderWidth={0.5}
        borderColor="#152538"
        legends={
          !isDashboard
            ? [
                {
                  anchor: "bottom-left",
                  direction: "column",
                  justify: true,
                  translateX: 20,
                  translateY: 0,
                  itemsSpacing: 0,
                  itemWidth: 94,
                  itemHeight: 18,
                  itemDirection: "left-to-right",
                  itemTextColor: "#fff",
                  itemOpacity: 0.85,
                  symbolSize: 18,
                  effects: [
                    {
                      on: "hover",
                      style: {
                        itemTextColor: "#999999",
                        itemOpacity: 1,
                      },
                    },
                  ],
                },
              ]
            : []
        }
        theme={{
          tooltip: {
            container: {
              color: "#000",
            },
          },
        }}
      />
      <div style={{ position: "absolute", bottom: 10, right: 10 }}>
        <button style={{ border:'0.2px solid cyan' , background: 'transparent', color: 'cyan', fontWeight: '600'}}  onClick={handleZoomIn}>+</button> 
        <button style={{ border:'0.2px solid cyan' , background: 'transparent', color: 'cyan', fontWeight: '600'}} onClick={handleZoomOut}>-</button>
      </div>
      <div style={{ position: "absolute", bottom: 10, right: 55 }}>
        <button style={{ border:'0.2px solid cyan' , background: 'transparent', color: 'cyan', fontWeight: '600'}} onClick={() => handlePan(-0.05, 0)}>←</button>
        <button style={{ border:'0.2px solid cyan' , background: 'transparent', color: 'cyan', fontWeight: '600'}} onClick={() => handlePan(0.05, 0)}>→</button>
        <button style={{ border:'0.2px solid cyan' , background: 'transparent', color: 'cyan', fontWeight: '600'}} onClick={() => handlePan(0, 0.05)}>↑</button>
        <button style={{ border:'0.2px solid cyan' , background: 'transparent', color: 'cyan', fontWeight: '600'}} onClick={() => handlePan(0, -0.05)}>↓</button>
      </div>
    </div>
  );
};

export default GeographyChart;
