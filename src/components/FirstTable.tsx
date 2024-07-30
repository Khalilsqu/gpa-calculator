import { useMemo, useState } from "react";

import {
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Box, // Import Box from MUI
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import {
  type MRT_ColumnDef,
  type MRT_TableOptions,
  MRT_EditActionButtons,
  useMaterialReactTable,
  MaterialReactTable,
} from "material-react-table";
import { useSnackbar } from "notistack";
import { useTheme } from "@mui/material/styles";

interface TableRow {
  index: string;
  gradePoints: number;
  creditsAttempted: number;
  cgpa: number;
}

import type { GpaRecord } from "App";

const FirstTable = ({
  gpaRecord,
  setGpaRecord,
}: {
  gpaRecord: GpaRecord;
  setGpaRecord: (record: GpaRecord) => void;
}) => {
  const { enqueueSnackbar } = useSnackbar();

  const theme = useTheme();

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const data = useMemo<TableRow[]>(
    () => [
      {
        index: "Current",
        gradePoints: gpaRecord.currentGradePoints,
        creditsAttempted: gpaRecord.currentAttemptedCredits,
        cgpa: gpaRecord.currentCGPA,
      },
      {
        index: "Expected",
        gradePoints: gpaRecord.expectedGradePoints,
        creditsAttempted: gpaRecord.expectedAttemptedCredits,
        cgpa: gpaRecord.expectedCGPA,
      },
    ],
    [gpaRecord]
  );

  const columns = useMemo<MRT_ColumnDef<TableRow>[]>(
    () => [
      {
        accessorKey: "index",
        header: "",
        enableEditing: false,
        size: 80,
        Edit: () => null,
      },
      {
        accessorKey: "gradePoints",
        header: "Grade Points",
        muiEditTextFieldProps: {
          type: "number",
          inputProps: { min: 0, step: 0.01 },
          required: true,
          error: !!validationErrors["gradePoints"],
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              gradePoints: undefined,
            })),
        },
      },
      {
        accessorKey: "creditsAttempted",
        header: "Credits Attempted",
        muiEditTextFieldProps: {
          type: "number",
          inputProps: { min: 0, step: 1 },
          required: true,
          error: !!validationErrors["creditsAttempted"],
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              creditsAttempted: undefined,
            })),
        },
      },
      {
        accessorKey: "cgpa",
        header: "C.GPA",
        enableEditing: false,
        Edit: () => null, //  don't show on modal
      },
    ],
    [validationErrors]
  );

  const handleSaveUser: MRT_TableOptions<TableRow>["onEditingRowSave"] =
    async ({ values, table }) => {
      const errors: Record<string, string> = {};
      const fieldsToCheck = ["gradePoints", "creditsAttempted"];

      fieldsToCheck.forEach((field) => {
        if (values[field] === "") {
          const columnHeader =
            columns.find((column) => column.accessorKey === field)?.header ||
            field;
          errors[field] = `${columnHeader} cannot be empty`;
        }
      });

      if (values.gradePoints < 0) {
        errors["gradePoints"] = "Grade Points cannot be negative";
      }
      if (values.creditsAttempted < 0) {
        errors["creditsAttempted"] = "Credits Attempted cannot be negative";
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      let cgpa = 0;
      const updatedData = data.map((row) => {
        cgpa = values.gradePoints / values.creditsAttempted;
        if (row.index === values.index) {
          return {
            ...row,
            ...values,
            cgpa: cgpa,
          };
        }
        return row;
      });

      if (cgpa > 4) {
        enqueueSnackbar(
          `C.GPA cannot be greater than 4, but is ${cgpa.toFixed(2)}`,
          {
            variant: "error",
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "right",
            },
          }
        );
        return;
      }

      const expectedGradePoints =
        Number(gpaRecord.expectedGradePoints) -
        Number(gpaRecord.currentGradePoints) +
        Number(updatedData[0].gradePoints);

      const expectedAttemptedCredits =
        Number(gpaRecord.expectedAttemptedCredits) -
        Number(gpaRecord.currentAttemptedCredits) +
        Number(updatedData[0].creditsAttempted);

      const expectedCGPA = expectedGradePoints / expectedAttemptedCredits;

      const updatedRecord = {
        ...gpaRecord,
        currentGradePoints: Number(updatedData[0].gradePoints),
        currentAttemptedCredits: Number(updatedData[0].creditsAttempted),
        currentCGPA: Number(cgpa.toFixed(2)),
        expectedGradePoints: expectedGradePoints,
        expectedAttemptedCredits: expectedAttemptedCredits,
        expectedCGPA: Number(expectedCGPA.toFixed(2)),
      };

      setGpaRecord(updatedRecord);

      table.setEditingRow(null);
    };

  const table = useMaterialReactTable({
    columns,
    data,
    editDisplayMode: "modal",
    enableTopToolbar: false,
    enableRowActions: true,
    enablePagination: false,
    enableSorting: false,
    enableColumnActions: false,
    positionActionsColumn: "last",
    initialState: {
      density: "compact",
    },
    getRowId: (row) => row.index,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveUser,
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => {
      return (
        <>
          <DialogTitle variant="h6" sx={{ textAlign: "center" }}>
            Edit GPA
          </DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {internalEditComponents}
          </DialogContent>
          <DialogActions>
            <MRT_EditActionButtons variant="text" table={table} row={row} />
          </DialogActions>
        </>
      );
    },
    renderRowActions: ({ row, table }) => {
      if (row.index === 1) {
        return null;
      }
      return (
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)} size="small">
            <EditIcon />
          </IconButton>
        </Tooltip>
      );
    },
    renderBottomToolbarCustomActions: () => (
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "1rem",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Box>
          <b>Overall Semester GPA:</b> {gpaRecord.overallSemGpa.toFixed(2)}
        </Box>
      </Box>
    ),
    muiTablePaperProps: {
      elevation: 0, //change the mui box shadow
      sx: {
        borderRadius: "5px",
        border: `1px solid ${
          theme.palette.mode === "dark" ? "#444242" : "#b3c0b3"
        }`,
      },
    },
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: theme.palette.mode === "dark" ? "#444242" : "#b3c0b3",
      },
    },
  });

  return (
    <Box sx={{ overflowX: "auto", width: "100%" }}>
      <MaterialReactTable table={table} />
    </Box>
  );
};

export default FirstTable;
