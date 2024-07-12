import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
  useTheme,
} from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";

// Custom styled components
const SubmissionBox = styled(Card)(({ theme }) => ({
  marginTop: "20px",
  padding: "20px",
  background: "transparent", // Remove background for lamp effect
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Subtle box shadow
}));

const LampEffect = styled(CardContent)(({ theme }) => ({
  position: "relative",
  background: "linear-gradient(to top, #00bfff, transparent)",
  "&::after": {
    content: '""',
    position: "absolute",
    left: 0,

    width: "100%",

    background: "linear-gradient(to top, rgba(0, 191, 255, 0.8), transparent)",
    boxShadow:
      "0 0 10px rgba(0, 191, 255, 0.8), 0 0 20px rgba(0, 191, 255, 0.8), 0 0 30px rgba(0, 191, 255, 0.8)",
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginTop: "10px",
  marginBottom: "10px",
  fontWeight: "bold",
  color: theme.palette.text.primary, // Use primary text color
}));

const SubmissionList = ({ formSubmissions, handleEditForm }) => {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const ButtonS = styled(Button)(({ theme }) => ({
    gridColumn: "span 4",
    display: "inline-flex",
    height: "48px",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    border: `2px solid ${colors.tealAccent[600]}`,
    boxShadow: `0 0 10px ${colors.tealAccent[600]}`,
    background: "linear-gradient(110deg,#000103 45%,#1e2631 55%,#000103)",
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
  }));

  const handleEdit = (submission, index) => {
    handleEditForm(submission, index);
  };

  return (
    <Box mt={20}>
      {formSubmissions.length > 0 && (
        <Box>
          <Header title="Form Submissions" />
          {formSubmissions.map((submission, index) => (
            <SubmissionBox key={index}>
              <LampEffect>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid
                      item
                      xs={12}
                      display={"flex"}
                      justifyContent={"space-between"}
                    >
                      <SectionTitle fontSize={"2rem"}>
                        Submission {index + 1}
                      </SectionTitle>
                      <ButtonS
                        variant="contained"
                        color="primary"
                        onClick={() => handleEdit(submission, index)}
                      >
                        Edit
                      </ButtonS>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h3">
                        Company Name : <b> {submission.companyName}</b>
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h3">
                        Email : <b> {submission.email}</b>
                      </Typography>
                    </Grid>
                    {/* Table sections */}
                    <Grid item xs={12}>
                      <SectionTitle fontFamily={"sans-serif"} fontSize={"1rem"}>
                        Sales Per Month
                      </SectionTitle>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>
                                <Typography
                                  fontFamily={"sans-serif"}
                                  fontSize={"1rem"}
                                >
                                  Month
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  fontFamily={"sans-serif"}
                                  fontSize={"1rem"}
                                >
                                  Amount
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  fontFamily={"sans-serif"}
                                  fontSize={"1rem"}
                                >
                                  Country
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {submission.salesPerMonth.map((sale, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{sale.month}</TableCell>
                                <TableCell>{sale.amount}</TableCell>
                                <TableCell>{sale.country}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                    <Grid item xs={12}>
                      <SectionTitle fontFamily={"sans-serif"} fontSize={"1rem"}>
                        Unique Selling Products
                      </SectionTitle>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>
                                <Typography
                                  fontFamily={"sans-serif"}
                                  fontSize={"1rem"}
                                >
                                  Product
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  fontFamily={"sans-serif"}
                                  fontSize={"1rem"}
                                >
                                  Country
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {submission.uniqueSellingProducts.map(
                              (product, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{product.product}</TableCell>
                                  <TableCell>{product.country}</TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                    <Grid item xs={12}>
                      <SectionTitle fontFamily={"sans-serif"} fontSize={"1rem"}>
                        Sales Per Unit
                      </SectionTitle>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>
                                <Typography
                                  fontFamily={"sans-serif"}
                                  fontSize={"1rem"}
                                >
                                  Country
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  fontFamily={"sans-serif"}
                                  fontSize={"1rem"}
                                >
                                  Unit Sales
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {submission.salesPerUnit.map((unit, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{unit.country}</TableCell>
                                <TableCell>{unit.unitSales}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                    <Grid item xs={12}>
                      <SectionTitle fontFamily={"sans-serif"} fontSize={"1rem"}>
                        Locations
                      </SectionTitle>
                      <TableContainer>
                        <Table>
                          <TableBody>
                            {submission.locations.map((location, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{location}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </CardContent>
              </LampEffect>
            </SubmissionBox>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default SubmissionList;

