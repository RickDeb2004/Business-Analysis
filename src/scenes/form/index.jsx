import { Box, Button, TextField, Autocomplete, useTheme } from "@mui/material";
import { Formik, FieldArray, useFormikContext } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { getAuth } from "firebase/auth";
import { get, getDatabase, ref, set } from "firebase/database";
import { useEffect, useState } from "react";
import { database } from "../../firebase";
import { tokens } from "../../theme";
import SubmissionList from "./Data";

const Form = () => {
  const theme = useTheme();
  const [data, setData] = useState([]);
  const [formSubmissions, setFormSubmissions] = useState([]);
  const [editIndex, setEditIndex] = useState(null); // Track edit index
  const [initialValues, setInitialValues] = useState({
    companyName: "",
    email: "",
    salesPerMonth: [{ month: "", amount: "", country: "" }],
    uniqueSellingProducts: [{ product: "", country: "" }],
    salesPerUnit: [{ country: "", unitSales: "" }],
    locations: [""],
  });

  const isNonMobile = useMediaQuery("(min-width:600px)");
  const colors = tokens(theme.palette.mode);

  const handleFormSubmit = (values) => {
    const auth = getAuth();
    const database = getDatabase();
    const user = auth.currentUser;

    if (user) {
      if (editIndex !== null) {
        setFormSubmissions((prev) => {
          const updatedSubmissions = [...prev];
          updatedSubmissions[editIndex] = values;
          return updatedSubmissions;
        });
        setEditIndex(null);
      } else {
        setFormSubmissions((prev) => [...prev, values]);
      }

      set(ref(database, "admins/" + user.uid + "/formData"), values)
        .then(() => {
          console.log("Data saved successfully!");
        })
        .catch((error) => {
          console.error("Error saving data:", error);
        });
    }

    //clear form
    setInitialValues({
      companyName: "",
      email: "",
      salesPerMonth: [{ month: "", amount: "", country: "" }],
      uniqueSellingProducts: [{ product: "", country: "" }],
      salesPerUnit: [{ country: "", unitSales: "" }],
      locations: [""],
    });
  };

  useEffect(() => {
    const fetchCountrydata = async () => {
      try {
        const snapshot = await get(ref(database, "countryData"));
        const data = snapshot.val();
        setData(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchCountrydata();
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const database = getDatabase();
    const user = auth.currentUser;

    if (user) {
      const userRef = ref(database, "admins/" + user.uid + "/formData");
      get(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setFormSubmissions((prev) => [...prev, data]);
          } else {
            console.log("No data available");
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, []);

  const handleEditForm = (existingFormData, index) => {
    // move to top of the form
    window.scrollTo(0, 0);
    setFormSubmissions((prev) => {
      const updatedSubmissions = [...prev];
      updatedSubmissions.splice(index, 1);
      return updatedSubmissions;
    });
    setEditIndex(index);
    setInitialValues(existingFormData);
  };

  return (
    <Box m="20px">
      <Header title="CREATE USER" subtitle="Create a New User Profile" />
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
        enableReinitialize // Add this to reinitialize form with initialValues
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setValues, // Add setValues here to update form values
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Company Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.companyName}
                name="companyName"
                error={!!touched.companyName && !!errors.companyName}
                helperText={touched.companyName && errors.companyName}
                sx={{
                  gridColumn: "span 4",
                  marginBottom: "10px",
                  boxShadow:
                    "0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)",
                  "&:hover": {
                    boxShadow: "0px 0px 8px 2px rgba(33,150,243,0.5)",
                  },
                }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{
                  gridColumn: "span 4",
                  marginBottom: "10px",
                  boxShadow:
                    "0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)",
                  "&:hover": {
                    boxShadow: "0px 0px 8px 2px rgba(33,150,243,0.5)",
                  },
                }}
              />

              <FieldArray name="salesPerMonth">
                {({ push, remove }) => (
                  <>
                    {values.salesPerMonth.map((sale, index) => (
                      <Box
                        key={index}
                        display="grid"
                        gap="30px"
                        gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                      >
                        <TextField
                          fullWidth
                          variant="filled"
                          type="text"
                          label="Month"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={sale.month}
                          name={`salesPerMonth[${index}].month`}
                          error={
                            !!touched.salesPerMonth?.[index]?.month &&
                            !!errors.salesPerMonth?.[index]?.month
                          }
                          helperText={
                            touched.salesPerMonth?.[index]?.month &&
                            errors.salesPerMonth?.[index]?.month
                          }
                          sx={{
                            gridColumn: "span 2",
                            marginBottom: "10px",
                            boxShadow:
                              "0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)",
                            "&:hover": {
                              boxShadow: "0px 0px 8px 2px rgba(33,150,243,0.5)",
                            },
                          }}
                        />
                        <TextField
                          fullWidth
                          variant="filled"
                          type="number"
                          label="Sales Amount"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={sale.amount}
                          name={`salesPerMonth[${index}].amount`}
                          error={
                            !!touched.salesPerMonth?.[index]?.amount &&
                            !!errors.salesPerMonth?.[index]?.amount
                          }
                          helperText={
                            touched.salesPerMonth?.[index]?.amount &&
                            errors.salesPerMonth?.[index]?.amount
                          }
                          sx={{
                            gridColumn: "span 2",
                            marginBottom: "10px",
                            boxShadow:
                              "0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)",
                            "&:hover": {
                              boxShadow: "0px 0px 8px 2px rgba(33,150,243,0.5)",
                            },
                          }}
                        />
                        <TextField
                          fullWidth
                          variant="filled"
                          type="text"
                          label="Country"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={sale.country}
                          name={`salesPerMonth[${index}].country`}
                          error={
                            !!touched.salesPerMonth?.[index]?.country &&
                            !!errors.salesPerMonth?.[index]?.country
                          }
                          helperText={
                            touched.salesPerMonth?.[index]?.country &&
                            errors.salesPerMonth?.[index]?.country
                          }
                          sx={{
                            gridColumn: "span 4",
                            marginBottom: "10px",
                            boxShadow:
                              "0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)",
                            "&:hover": {
                              boxShadow: "0px 0px 8px 2px rgba(33,150,243,0.5)",
                            },
                          }}
                        />
                        <Button
                          type="button"
                          color="secondary"
                          variant="contained"
                          onClick={() => remove(index)}
                          sx={{
                            gridColumn: "span 4",
                            display: "inline-flex",
                            height: "48px",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "8px",

                            border: `2px solid ${colors.tealAccent[600]}`,
                            boxShadow: `0 0 10px ${colors.tealAccent[600]}`,
                            background:
                              "linear-gradient(110deg,#000103 45%,#1e2631 55%,#000103)",
                            backgroundSize: "200% 100%",
                            px: 6,
                            color: "#9CA3AF",
                            fontWeight: "500",
                            textTransform: "none",
                            animation: "shimmer 2s infinite",
                            transition: "color 0.3s",
                            "&:hover": {
                              color: "#FFFFFF",
                            },
                            "&:focus": {
                              outline: "none",
                              boxShadow: "0 0 0 4px rgba(148, 163, 184, 0.6)",
                            },
                            "@keyframes shimmer": {
                              "0%": { backgroundPosition: "200% 0" },
                              "100%": { backgroundPosition: "-200% 0" },
                            },
                          }}
                        >
                          Remove Sale
                        </Button>
                      </Box>
                    ))}
                    <Button
                      type="button"
                      color="secondary"
                      variant="contained"
                      onClick={() =>
                        push({ month: "", amount: "", country: "" })
                      }
                      sx={{
                        gridColumn: "span 4",
                        display: "inline-flex",
                        height: "48px",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "8px",

                        border: `2px solid ${colors.tealAccent[600]}`,
                        boxShadow: `0 0 10px ${colors.tealAccent[600]}`,
                        background:
                          "linear-gradient(110deg,#000103 45%,#1e2631 55%,#000103)",
                        backgroundSize: "200% 100%",
                        px: 6,
                        color: "#9CA3AF",
                        fontWeight: "500",
                        textTransform: "none",
                        animation: "shimmer 2s infinite",
                        transition: "color 0.3s",
                        "&:hover": {
                          color: "#FFFFFF",
                        },
                        "&:focus": {
                          outline: "none",
                          boxShadow: "0 0 0 4px rgba(148, 163, 184, 0.6)",
                        },
                        "@keyframes shimmer": {
                          "0%": { backgroundPosition: "200% 0" },
                          "100%": { backgroundPosition: "-200% 0" },
                        },
                      }}
                    >
                      Add Sale
                    </Button>
                  </>
                )}
              </FieldArray>

              <FieldArray name="uniqueSellingProducts">
                {({ push, remove }) => (
                  <>
                    {values.uniqueSellingProducts.map((product, index) => (
                      <Box
                        key={index}
                        display="grid"
                        gap="30px"
                        gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                      >
                        <TextField
                          fullWidth
                          variant="filled"
                          type="text"
                          label="Product"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={product.product}
                          name={`uniqueSellingProducts[${index}].product`}
                          error={
                            !!touched.uniqueSellingProducts?.[index]?.product &&
                            !!errors.uniqueSellingProducts?.[index]?.product
                          }
                          helperText={
                            touched.uniqueSellingProducts?.[index]?.product &&
                            errors.uniqueSellingProducts?.[index]?.product
                          }
                          sx={{
                            gridColumn: "span 2",
                            marginBottom: "10px",
                            boxShadow:
                              "0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)",
                            "&:hover": {
                              boxShadow: "0px 0px 8px 2px rgba(33,150,243,0.5)",
                            },
                          }}
                        />
                        <TextField
                          fullWidth
                          variant="filled"
                          type="text"
                          label="Country"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={product.country}
                          name={`uniqueSellingProducts[${index}].country`}
                          error={
                            !!touched.uniqueSellingProducts?.[index]?.country &&
                            !!errors.uniqueSellingProducts?.[index]?.country
                          }
                          helperText={
                            touched.uniqueSellingProducts?.[index]?.country &&
                            errors.uniqueSellingProducts?.[index]?.country
                          }
                          sx={{
                            gridColumn: "span 2",
                            marginBottom: "10px",
                            boxShadow:
                              "0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)",
                            "&:hover": {
                              boxShadow: "0px 0px 8px 2px rgba(33,150,243,0.5)",
                            },
                          }}
                        />
                        <Button
                          type="button"
                          color="secondary"
                          variant="contained"
                          onClick={() => remove(index)}
                          sx={{
                            gridColumn: "span 4",
                            display: "inline-flex",
                            height: "48px",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "8px",

                            border: `2px solid ${colors.tealAccent[600]}`,
                            boxShadow: `0 0 10px ${colors.tealAccent[600]}`,
                            background:
                              "linear-gradient(110deg,#000103 45%,#1e2631 55%,#000103)",
                            backgroundSize: "200% 100%",
                            px: 6,
                            color: "#9CA3AF",
                            fontWeight: "500",
                            textTransform: "none",
                            animation: "shimmer 2s infinite",
                            transition: "color 0.3s",
                            "&:hover": {
                              color: "#FFFFFF",
                            },
                            "&:focus": {
                              outline: "none",
                              boxShadow: "0 0 0 4px rgba(148, 163, 184, 0.6)",
                            },
                            "@keyframes shimmer": {
                              "0%": { backgroundPosition: "200% 0" },
                              "100%": { backgroundPosition: "-200% 0" },
                            },
                          }}
                        >
                          Remove Product
                        </Button>
                      </Box>
                    ))}
                    <Button
                      type="button"
                      color="secondary"
                      variant="contained"
                      onClick={() => push({ product: "", country: "" })}
                      sx={{
                        gridColumn: "span 4",
                        display: "inline-flex",
                        height: "48px",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "8px",

                        border: `2px solid ${colors.tealAccent[600]}`,
                        boxShadow: `0 0 10px ${colors.tealAccent[600]}`,
                        background:
                          "linear-gradient(110deg,#000103 45%,#1e2631 55%,#000103)",
                        backgroundSize: "200% 100%",
                        px: 6,
                        color: "#9CA3AF",
                        fontWeight: "500",
                        textTransform: "none",
                        animation: "shimmer 2s infinite",
                        transition: "color 0.3s",
                        "&:hover": {
                          color: "#FFFFFF",
                        },
                        "&:focus": {
                          outline: "none",
                          boxShadow: "0 0 0 4px rgba(148, 163, 184, 0.6)",
                        },
                        "@keyframes shimmer": {
                          "0%": { backgroundPosition: "200% 0" },
                          "100%": { backgroundPosition: "-200% 0" },
                        },
                      }}
                    >
                      Add Product
                    </Button>
                  </>
                )}
              </FieldArray>

              <FieldArray name="salesPerUnit">
                {({ push, remove }) => (
                  <>
                    {values.salesPerUnit.map((sale, index) => (
                      <Box
                        key={index}
                        display="grid"
                        gap="30px"
                        gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                      >
                        <Autocomplete
                          fullWidth
                          options={data}
                          getOptionLabel={(option) =>
                            `${option["alpha-3"]} - ${option.name}`
                          }
                          onChange={(e, value) => {
                            handleChange({
                              target: {
                                name: `salesPerUnit[${index}].country`,
                                value: value ? value["alpha-3"] : "", // only the ISO code
                              },
                            });
                          }}
                          onBlur={handleBlur}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="filled"
                              label="Country"
                              name={`salesPerUnit[${index}].country`}
                              error={
                                !!touched.salesPerUnit?.[index]?.country &&
                                !!errors.salesPerUnit?.[index]?.country
                              }
                              helperText={
                                touched.salesPerUnit?.[index]?.country &&
                                errors.salesPerUnit?.[index]?.country
                              }
                              sx={{
                                gridColumn: "span 2",
                                marginBottom: "10px",
                                boxShadow:
                                  "0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)",
                                "&:hover": {
                                  boxShadow:
                                    "0px 0px 8px 2px rgba(33,150,243,0.5)",
                                },
                              }}
                            />
                          )}
                          sx={{
                            gridColumn: "span 2",
                            marginBottom: "10px",
                            boxShadow:
                              "0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)",
                            "&:hover": {
                              boxShadow: "0px 0px 8px 2px rgba(33,150,243,0.5)",
                            },
                          }}
                        />
                        <TextField
                          fullWidth
                          variant="filled"
                          type="number"
                          label="Unit Sales"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={sale.unitSales}
                          name={`salesPerUnit[${index}].unitSales`}
                          error={
                            !!touched.salesPerUnit?.[index]?.unitSales &&
                            !!errors.salesPerUnit?.[index]?.unitSales
                          }
                          helperText={
                            touched.salesPerUnit?.[index]?.unitSales &&
                            errors.salesPerUnit?.[index]?.unitSales
                          }
                          sx={{
                            gridColumn: "span 2",
                            marginBottom: "10px",
                            boxShadow:
                              "0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)",
                            "&:hover": {
                              boxShadow: "0px 0px 8px 2px rgba(33,150,243,0.5)",
                            },
                          }}
                        />
                        <Button
                          type="button"
                          color="secondary"
                          variant="contained"
                          onClick={() => remove(index)}
                          sx={{
                            gridColumn: "span 4",
                            display: "inline-flex",
                            height: "48px",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "8px",

                            border: `2px solid ${colors.tealAccent[600]}`,
                            boxShadow: `0 0 10px ${colors.tealAccent[600]}`,
                            background:
                              "linear-gradient(110deg,#000103 45%,#1e2631 55%,#000103)",
                            backgroundSize: "200% 100%",
                            px: 6,
                            color: "#9CA3AF",
                            fontWeight: "500",
                            textTransform: "none",
                            animation: "shimmer 2s infinite",
                            transition: "color 0.3s",
                            "&:hover": {
                              color: "#FFFFFF",
                            },
                            "&:focus": {
                              outline: "none",
                              boxShadow: "0 0 0 4px rgba(148, 163, 184, 0.6)",
                            },
                            "@keyframes shimmer": {
                              "0%": { backgroundPosition: "200% 0" },
                              "100%": { backgroundPosition: "-200% 0" },
                            },
                          }}
                        >
                          Remove Sale
                        </Button>
                      </Box>
                    ))}
                    <Button
                      type="button"
                      color="secondary"
                      variant="contained"
                      onClick={() => push({ country: "", unitSales: "" })}
                      sx={{
                        gridColumn: "span 4",
                        display: "inline-flex",
                        height: "48px",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "8px",

                        border: `2px solid ${colors.tealAccent[600]}`,
                        boxShadow: `0 0 10px ${colors.tealAccent[600]}`,
                        background:
                          "linear-gradient(110deg,#000103 45%,#1e2631 55%,#000103)",
                        backgroundSize: "200% 100%",
                        px: 6,
                        color: "#9CA3AF",
                        fontWeight: "500",
                        textTransform: "none",
                        animation: "shimmer 2s infinite",
                        transition: "color 0.3s",
                        "&:hover": {
                          color: "#FFFFFF",
                        },
                        "&:focus": {
                          outline: "none",
                          boxShadow: "0 0 0 4px rgba(148, 163, 184, 0.6)",
                        },
                        "@keyframes shimmer": {
                          "0%": { backgroundPosition: "200% 0" },
                          "100%": { backgroundPosition: "-200% 0" },
                        },
                      }}
                    >
                      Add Sale
                    </Button>
                  </>
                )}
              </FieldArray>

              <FieldArray name="locations">
                {({ push, remove }) => (
                  <>
                    {values.locations.map((location, index) => (
                      <Box
                        key={index}
                        display="grid"
                        gap="30px"
                        gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                      >
                        <TextField
                          fullWidth
                          variant="filled"
                          type="text"
                          label="Location"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          value={location}
                          name={`locations[${index}]`}
                          error={
                            !!touched.locations?.[index] &&
                            !!errors.locations?.[index]
                          }
                          helperText={
                            touched.locations?.[index] &&
                            errors.locations?.[index]
                          }
                          sx={{
                            gridColumn: "span 4",
                            marginBottom: "10px",
                            boxShadow:
                              "0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)",
                            "&:hover": {
                              boxShadow: "0px 0px 8px 2px rgba(33,150,243,0.5)",
                            },
                          }}
                        />
                        <Button
                          type="button"
                          color="secondary"
                          variant="contained"
                          onClick={() => remove(index)}
                          sx={{
                            gridColumn: "span 4",
                            display: "inline-flex",
                            height: "48px",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "8px",

                            border: `2px solid ${colors.tealAccent[600]}`,
                            boxShadow: `0 0 10px ${colors.tealAccent[600]}`,
                            background:
                              "linear-gradient(110deg,#000103 45%,#1e2631 55%,#000103)",
                            backgroundSize: "200% 100%",
                            px: 6,
                            color: "#9CA3AF",
                            fontWeight: "500",
                            textTransform: "none",
                            animation: "shimmer 2s infinite",
                            transition: "color 0.3s",
                            "&:hover": {
                              color: "#FFFFFF",
                            },
                            "&:focus": {
                              outline: "none",
                              boxShadow: "0 0 0 4px rgba(148, 163, 184, 0.6)",
                            },
                            "@keyframes shimmer": {
                              "0%": { backgroundPosition: "200% 0" },
                              "100%": { backgroundPosition: "-200% 0" },
                            },
                          }}
                        >
                          Remove Location
                        </Button>
                      </Box>
                    ))}
                    <Button
                      type="button"
                      color="secondary"
                      variant="contained"
                      onClick={() => push("")}
                      sx={{
                        gridColumn: "span 4",
                        display: "inline-flex",
                        height: "48px",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "8px",

                        border: `2px solid ${colors.tealAccent[600]}`,
                        boxShadow: `0 0 10px ${colors.tealAccent[600]}`,
                        background:
                          "linear-gradient(110deg,#000103 45%,#1e2631 55%,#000103)",
                        backgroundSize: "200% 100%",
                        px: 6,
                        color: "#9CA3AF",
                        fontWeight: "500",
                        textTransform: "none",
                        animation: "shimmer 2s infinite",
                        transition: "color 0.3s",
                        "&:hover": {
                          color: "#FFFFFF",
                        },
                        "&:focus": {
                          outline: "none",
                          boxShadow: "0 0 0 4px rgba(148, 163, 184, 0.6)",
                        },
                        "@keyframes shimmer": {
                          "0%": { backgroundPosition: "200% 0" },
                          "100%": { backgroundPosition: "-200% 0" },
                        },
                      }}
                    >
                      Add Location
                    </Button>
                  </>
                )}
              </FieldArray>
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button
                type="submit"
                color="secondary"
                variant="contained"
                sx={{
                  display: "inline-flex",
                  height: "48px",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",

                  border: `2px solid ${colors.tealAccent[600]}`,
                  boxShadow: `0 0 10px ${colors.tealAccent[600]}`,
                  background:
                    "linear-gradient(110deg,#000103 45%,#1e2631 55%,#000103)",
                  backgroundSize: "200% 100%",
                  px: 6,
                  color: "#9CA3AF",
                  fontWeight: "500",
                  textTransform: "none",
                  animation: "shimmer 2s infinite",
                  transition: "color 0.3s",
                  "&:hover": {
                    color: "#FFFFFF",
                  },
                  "&:focus": {
                    outline: "none",
                    boxShadow: "0 0 0 4px rgba(148, 163, 184, 0.6)",
                  },
                  "@keyframes shimmer": {
                    "0%": { backgroundPosition: "200% 0" },
                    "100%": { backgroundPosition: "-200% 0" },
                  },
                }}
              >
                Submit
              </Button>
            </Box>
          </form>
        )}
      </Formik>
      <SubmissionList
        formSubmissions={formSubmissions}
        handleEditForm={handleEditForm}
      />
    </Box>
  );
};

const phoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

const checkoutSchema = yup.object().shape({
  companyName: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
  salesPerMonth: yup.array().of(
    yup.object().shape({
      month: yup.string().required("required"),
      amount: yup.number().required("required"),
      country: yup.string().required("required"),
    })
  ),
  uniqueSellingProducts: yup.array().of(
    yup.object().shape({
      product: yup.string().required("required"),
      country: yup.string().required("required"),
    })
  ),
  salesPerUnit: yup.array().of(
    yup.object().shape({
      country: yup.string().required("required"),
      unitSales: yup.number().required("required"),
    })
  ),
  locations: yup.array().of(yup.string().required("required")),
});

const initialValues = {
  companyName: "",
  email: "",
  salesPerMonth: [{ month: "", amount: "", country: "" }],
  uniqueSellingProducts: [{ product: "", country: "" }],
  salesPerUnit: [{ country: "", unitSales: "" }],
  locations: [""],
};

export default Form;
