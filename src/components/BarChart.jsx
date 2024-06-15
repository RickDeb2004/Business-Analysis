import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';
import { tokens } from '../theme';
import { getDatabase, ref, get } from 'firebase/database';
import { auth } from '../firebase';

const fetchData = async () => {
  if (!auth.currentUser) {
    console.error("User is not authenticated");
    return { salesPerUnit: [], uniqueSellingProducts: [] };
  }
  const db = getDatabase();
  const salesPerUnitRef = ref(db, `users/${auth.currentUser.uid}/formData/salesPerUnit`);
  const uniqueSellingProductsRef = ref(db, `users/${auth.currentUser.uid}/formData/uniqueSellingProducts`);

  const [salesPerUnitSnapshot, uniqueSellingProductsSnapshot] = await Promise.all([
    get(salesPerUnitRef),
    get(uniqueSellingProductsRef),
  ]);

  const salesPerUnit = salesPerUnitSnapshot.exists() ? salesPerUnitSnapshot.val() : [];
  const uniqueSellingProducts = uniqueSellingProductsSnapshot.exists() ? uniqueSellingProductsSnapshot.val() : [];

  return { salesPerUnit, uniqueSellingProducts };
};

// Function to generate unique colors for each product
const generateColors = (products) => {
  const colors = {};
  products.forEach((product, index) => {
    const hue = Math.floor((index / products.length) * 360);
    colors[product] = `hsl(${hue}, 70%, 50%)`;
  });
  return colors;
};

const transformData = (salesPerUnit, uniqueSellingProducts) => {
  // Get unique products
  const uniqueProducts = uniqueSellingProducts.map(item => item.product);
  const productColors = generateColors(uniqueProducts);

  const data = salesPerUnit.map((sale) => {
    const product = uniqueSellingProducts.find((item) => item.country === sale.country)?.product || 'Unknown Product';
    return {
      country: sale.country,
      [product]: sale.unitSales,
      [`${product}Color`]: productColors[product] || productColors['Unknown Product'],
    };
  });
  console.log('Sales Per Unit:', salesPerUnit);
  console.log('Unique Selling Products:', uniqueSellingProducts);
  console.log('Transformed Data:', data);
  return data;
};

const BarChart = ({ isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchAndTransformData = async () => {
      const { salesPerUnit, uniqueSellingProducts } = await fetchData();
      const transformedData = transformData(salesPerUnit, uniqueSellingProducts);
      setData(transformedData);
    };

    fetchAndTransformData();
  }, []);

  return (
    <ResponsiveBar
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
      keys={data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'country' && !key.endsWith('Color')) : []}
      indexBy="country"
      margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
      padding={0.3}
      valueScale={{ type: 'linear' }}
      indexScale={{ type: 'band', round: true }}
      colors={({ id, data }) => data[`${id}Color`]}
      borderColor={{
        from: 'color',
        modifiers: [['darker', '1.6']],
      }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : 'country',
        legendPosition: 'middle',
        legendOffset: 32,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : 'units',
        legendPosition: 'middle',
        legendOffset: -40,
      }}
      enableLabel={false}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
        from: 'color',
        modifiers: [['darker', 1.6]],
      }}
      legends={[
        {
          dataFrom: 'keys',
          anchor: 'bottom-right',
          direction: 'column',
          justify: false,
          translateX: 120,
          translateY: 0,
          itemsSpacing: 2,
          itemWidth: 100,
          itemHeight: 20,
          itemDirection: 'left-to-right',
          itemOpacity: 0.85,
          symbolSize: 20,
          effects: [
            {
              on: 'hover',
              style: {
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
      tooltip={({ id, value, indexValue }) => (
        <div
          style={{
            padding: '12px',
            color: '#fff',
            background: '#333',
          }}
        >
          <strong>
            {indexValue}: {id} ({value})
          </strong>
        </div>
      )}
      role="application"
      barAriaLabel={function (e) {
        return e.id + ': ' + e.formattedValue + ' in country: ' + e.indexValue;
      }}
    />
  );
};

export default BarChart;
