import { Box, Typography, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface HeaderProps {
  hasChanges: boolean;
  onReset: () => void;
}

const Header = ({ hasChanges, onReset }: HeaderProps) => {
  const theme = useTheme();

  return hasChanges ? (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
        marginBottom: "2rem",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          margin: "2rem 0",
          maxWidth: "65vw", // Adjust max width for mobile
          fontSize: { xs: "1rem", sm: "1.5rem" }, // Responsive font size
          [theme.breakpoints.up("sm")]: {
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            overflow: "hidden",
          },
        }}
      >
        GPA Calculator - Probation students
      </Typography>
      <Box
        sx={{
          flexGrow: 1,
          [theme.breakpoints.up("sm")]: { display: "block" },
        }}
      />
      <Button
        variant="contained"
        color="secondary"
        onClick={onReset}
        style={{ textTransform: "none" }}
      >
        Reset
      </Button>
    </Box>
  ) : (
    <Typography
      variant="h5"
      sx={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "2rem",
        fontSize: { xs: "1.2rem", sm: "1.5rem" },
      }}
    >
      GPA Calculator - Probation students
    </Typography>
  );
};

export default Header;
