import { Typography } from "@mui/material";

interface CellProps {
  renderedCellValue:
    | number
    | string
    | boolean
    | React.ReactNode
    | null
    | undefined;
}

export const renderNumberCell = ({ renderedCellValue }: CellProps) => (
  <Typography variant="body2">
    {typeof renderedCellValue === "number"
      ? renderedCellValue.toFixed(2)
      : "N/A"}
  </Typography>
);
