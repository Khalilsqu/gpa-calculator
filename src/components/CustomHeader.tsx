import React, { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";

import { type MRT_ColumnDef } from "material-react-table";
import { TableRow } from "components/FirstTable";

const HeaderWithTooltip = ({
  columnDef,
  title,
}: {
  columnDef: MRT_ColumnDef<TableRow>;
  title: React.ReactNode;
}) => {
  const [toolTipGradePointOpen, setToolTipGradePointOpen] = useState(false);

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {columnDef.header}
      <Tooltip
        title={title}
        open={toolTipGradePointOpen}
        onClose={() => setToolTipGradePointOpen(false)}
        componentsProps={{
          tooltip: {
            sx: {
              maxWidth: "250px",
            },
          },
        }}
      >
        <IconButton
          size="small"
          style={{ marginLeft: "0.2rem" }}
          onClick={() => setToolTipGradePointOpen((prev) => !prev)}
        >
          <InfoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  );
};

export default HeaderWithTooltip;
