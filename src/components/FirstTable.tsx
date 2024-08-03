import { useMemo, useState } from "react";

import {
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Box,
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

export interface TableRow {
  index: string;
  gradePoints: number;
  creditsAttempted: number;
  cgpa: number;
}

import type { GpaRecord } from "App";

import CellRenderer from "components/CellRenderer";

const FirstTable = ({
  gpaRecord,
  setGpaRecord,
  repeatCredits,
  newCredits,
  setHasChanges,
}: {
  gpaRecord: GpaRecord;
  setGpaRecord: (record: GpaRecord) => void;
  repeatCredits: number;
  newCredits: number;
  setHasChanges: (hasChanges: boolean) => void;
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
        Cell: (props) => (
          <CellRenderer
            {...props}
            title={
              <p>
                Can be found at the end of the academic transcript next to
                <strong style={{ color: "blue", fontStyle: "italic" }}>
                  {" "}
                  TOTAL GRADE POINTS
                </strong>
              </p>
            }
          />
        ),

        muiEditTextFieldProps: {
          type: "number",
          inputProps: { min: 0, step: 0.01 },
          required: true,
          error: !!validationErrors["gradePoints"],
          helperText: validationErrors["gradePoints"],
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              gradePoints: undefined,
            })),
        },
        width: "80px",
      },
      {
        accessorKey: "creditsAttempted",
        header: "Credits Attempted",
        Cell: (props) => (
          <CellRenderer
            {...props}
            title={
              <p>
                Can be found at the end of the academic transcript next to
                <strong
                  style={{
                    color: "blue",
                    fontStyle: "italic",
                  }}
                >
                  {" "}
                  TOTAL CREDITS ATTEMPTED
                </strong>
              </p>
            }
          />
        ),
        muiEditTextFieldProps: {
          type: "number",
          inputProps: { min: 0, step: 1 },
          required: true,
          error: !!validationErrors["creditsAttempted"],
          helperText: validationErrors["creditsAttempted"],
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
        Cell: ({ cell, row }) => {
          const cellValue = cell.getValue<number>();
          if (row.index === 1 && cellValue >= 2.0) {
            return (
              <span
                style={{
                  color: "green",
                  fontWeight: "bold",
                  fontSize: 16,
                  backgroundColor: "yellow",
                  padding: "5px",
                  borderRadius: "5px",
                }}
              >
                {cellValue} 👍
              </span>
            );
          } else if (
            row.index === 1 &&
            cellValue < 2.0 &&
            repeatCredits + newCredits > 0
          ) {
            return (
              <>
                <span
                  style={{
                    color: "red",
                    fontWeight: "bold",
                    fontSize: 16,
                    backgroundColor: "yellow",
                    padding: "5px",
                    borderRadius: "5px",
                  }}
                >
                  {cellValue} 👎
                </span>
              </>
            );
          } else {
            return <span>{cellValue}</span>;
          }
        },
      },
    ],
    [validationErrors]
  );

  const handleSaveUser: MRT_TableOptions<TableRow>["onEditingRowSave"] =
    async ({ values, table }) => {
      const errors: Record<string, string> = {};

      // check if required fields are empty

      if (!values.gradePoints) {
        errors["gradePoints"] = "Grade Points is required";
      }

      if (!values.creditsAttempted) {
        errors["creditsAttempted"] = "Credits Attempted is required";
      }

      if (values.gradePoints < 0) {
        errors["gradePoints"] = "Grade Points cannot be negative";
      }
      if (values.creditsAttempted < 0) {
        errors["creditsAttempted"] = "Credits Attempted cannot be negative";
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
        // return;

        const errorTest = "C.GPA > 4";

        errors["gradePoints"] = errorTest;
        errors["creditsAttempted"] = errorTest;
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
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

      let expectedCGPA = expectedGradePoints / expectedAttemptedCredits;

      // check if expectedCGPA is NaN or infinity

      if (Number(expectedAttemptedCredits) === 0 || isNaN(expectedCGPA)) {
        expectedCGPA = 0;
      }

      if (Number(updatedData[0].creditsAttempted) === 0 || isNaN(cgpa)) {
        cgpa = 0;
      }

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

      enqueueSnackbar("Update is successful", {
        variant: "success",
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "right",
        },
      });

      setHasChanges(true);
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
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      );
    },
    renderBottomToolbarCustomActions: () => {
      const totalCredits = repeatCredits + newCredits;
      let text: JSX.Element | string = "";

      const style = {
        color: "blue",
        background: "yellow",
        padding: "5px",
        borderRadius: "5px",
      };

      if (totalCredits > 12) {
        text = (
          <>
            Exceeded maximum allowed credits by{" "}
            <span style={style}>{totalCredits - 12}</span>
          </>
        );
      } else if (totalCredits < 9 && totalCredits > 0) {
        text = (
          <>
            Register for <span style={style}>{9 - totalCredits}</span> more
            credits to meet the minimum of{" "}
            <span style={{ color: "red" }}>9</span>
          </>
        );
      } else if (totalCredits >= 9 && totalCredits < 12) {
        text = (
          <>
            You can register for <span style={style}>{12 - totalCredits}</span>{" "}
            more credits
          </>
        );
      }

      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box>{text}</Box>
          <Box>
            <b>Overall Semester GPA:</b> {gpaRecord.overallSemGpa.toFixed(2)}
          </Box>
        </Box>
      );
    },

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
