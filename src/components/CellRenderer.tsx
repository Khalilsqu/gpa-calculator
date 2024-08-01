import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import { Typography, useMediaQuery } from "@mui/material";
import { type MRT_Cell, type MRT_Row } from "material-react-table";
// import CircularTimer from "./CircularTimer"; // Import the CircularTimer component
import { useEffect, useState } from "react";

import { type TableRow } from "components/FirstTable";

interface CellRendererProps {
  cell: MRT_Cell<TableRow, unknown>;
  row: MRT_Row<TableRow>;
  title: React.ReactNode;
}

const CellRenderer = ({ cell, row, title }: CellRendererProps) => {
  const cellValue = cell.getValue<number>();
  const tooltipDuration = 6000;

  const isMobile = useMediaQuery("(max-width:768px)");

  return row.index === 0 && cellValue === 0 ? (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <span>{cellValue}</span>
      <div>
        <Tooltip
          arrow
          title={
            <div>
              <Typography sx={{ lineHeight: 1.8, fontSize: "0.8rem" }}>
                {title}
              </Typography>
              {isMobile && <HorizontalProgressBar duration={tooltipDuration} />}
            </div>
          }
          disableFocusListener
          enterTouchDelay={0}
          leaveTouchDelay={tooltipDuration}
          componentsProps={{
            tooltip: {
              sx: {
                maxWidth: "250px",
              },
            },
          }}
        >
          <IconButton size="small" style={{ marginLeft: "0.2rem" }}>
            <InfoIcon style={{ fontSize: "1rem" }} />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  ) : (
    <span>{cellValue}</span>
  );
};

export default CellRenderer;

interface HorizontalProgressBarProps {
  duration: number;
}

const HorizontalProgressBar = ({ duration }: HorizontalProgressBarProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 100 : 0));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const progress = (timeLeft / duration) * 100;

  return (
    <div
      style={{
        width: "100%",
        height: "4px",
        backgroundColor: "#e0e0e0",
        marginTop: "4px",
        borderRadius: "2px",
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          backgroundColor: "#a3d394",
          transition: "width 0.1s linear",
          borderRadius: "2px",
        }}
      />
    </div>
  );
};
