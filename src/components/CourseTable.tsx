import { useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  type MRT_ColumnDef,
  type MRT_TableOptions,
  MaterialReactTable,
  MRT_EditActionButtons,
  useMaterialReactTable,
} from "material-react-table";
import { useSnackbar } from "notistack";
import type { GpaNewCourse, GpaRepeatCourse } from "App";
import type { GradeValueLabel } from "constants/gradeValueLabel";

function isRepeatCourse(
  course: GpaNewCourse | GpaRepeatCourse
): course is GpaRepeatCourse {
  return (course as GpaRepeatCourse).oldGrade !== undefined;
}

interface RepeatTableProps {
  isRepeat: boolean;
  data: GpaRepeatCourse[] | GpaNewCourse[];
  otherDataCodes: string[];
  semGpa: number;
  gradeLabels: GradeValueLabel[];
  updateAction: (course: GpaNewCourse | GpaRepeatCourse) => void;
  addAction: (course: GpaNewCourse | GpaRepeatCourse) => void;
  deleteAction: (id: string, isRepeat: boolean) => void;
}

interface TableRow {
  id: string;
  code: string;
  oldGrade?: string;
  newGrade?: string;
  grade?: string;
  credit: number;
  points?: number;
  semPoints: number;
}

const CourseTable = ({
  isRepeat,
  data,
  otherDataCodes,
  semGpa,
  gradeLabels,
  updateAction,
  addAction,
  deleteAction,
}: RepeatTableProps) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const tableData = useMemo<TableRow[]>(
    () =>
      data.map((course) => ({
        id: course.id,
        code: course.code,
        oldGrade:
          isRepeat && isRepeatCourse(course) ? course.oldGrade : undefined,
        newGrade:
          isRepeat && isRepeatCourse(course) ? course.newGrade : undefined,
        grade: !isRepeat && !isRepeatCourse(course) ? course.grade : undefined,
        credit: course.credit,
        points: isRepeat && isRepeatCourse(course) ? course.points : undefined,
        semPoints: course.semPoints,
      })),
    [data, isRepeat]
  );

  const columns = useMemo<MRT_ColumnDef<TableRow>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Course Code",
        size: 80,
        muiEditTextFieldProps: {
          required: true,
          placeholder: "e.g. COMP1000",
          inputProps: { maxLength: 8, autoComplete: "off" },
          error: !!validationErrors["code"],
          helperText: validationErrors?.code,
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              code: undefined,
            })),
        },
      },
      ...(isRepeat
        ? [
            {
              accessorKey: "oldGrade",
              header: "Old Grade",
              editVariant: "select" as const,
              editSelectOptions: gradeLabels.map((grade) => grade.label),
              muiEditTextFieldProps: {
                select: true,
                required: true,
                error: !!validationErrors["oldGrade"],
                helperText: validationErrors?.oldGrade,
                onFocus: () =>
                  setValidationErrors((prev) => ({
                    ...prev,
                    oldGrade: undefined,
                  })),
              },
              size: 80,
            },
            {
              accessorKey: "newGrade",
              header: "New Grade",
              editVariant: "select" as const,
              editSelectOptions: gradeLabels.map((grade) => grade.label),
              muiEditTextFieldProps: {
                select: true,
                required: true,
                error: !!validationErrors["newGrade"],
                helperText: validationErrors?.newGrade,
                onFocus: () =>
                  setValidationErrors((prev) => ({
                    ...prev,
                    newGrade: undefined,
                  })),
              },
              size: 100,
            },
          ]
        : [
            {
              accessorKey: "grade",
              header: "Grade",
              editVariant: "select" as const,
              editSelectOptions: gradeLabels.map((grade) => grade.label),
              muiEditTextFieldProps: {
                select: true,
                required: true,
                error: !!validationErrors["grade"],
                helperText: validationErrors?.grade,
                onFocus: () =>
                  setValidationErrors((prev) => ({
                    ...prev,
                    grade: undefined,
                  })),
              },
              size: 100,
            },
          ]),
      {
        accessorKey: "credit",
        header: "Credit",
        muiEditTextFieldProps: {
          type: "number",
          inputProps: { min: 1, max: 9, step: 1 },
          required: true,
          placeholder: "1 to 9",
          error: !!validationErrors["credit"],
          helperText: validationErrors?.credit,
          onFocus: () =>
            setValidationErrors((prev) => ({
              ...prev,
              credit: undefined,
            })),
        },
        size: 80,
      },
      ...(isRepeat
        ? [
            {
              accessorKey: "points",
              header: "Points",
              enableEditing: false,
              size: 80,
              Edit: () => null,
            },
          ]
        : []),
      {
        accessorKey: "semPoints",
        header: "Semester Points",
        enableEditing: false,
        size: 80,
        Edit: () => null,
      },
    ],
    [validationErrors, gradeLabels, isRepeat]
  );

  const handleCreateCourse: MRT_TableOptions<TableRow>["onCreatingRowSave"] =
    async ({ values, table }) => {
      const errors = validate({
        values,
        data: tableData,
        method: "handleCreate",
        isRepeat,
      });

      if (otherDataCodes.includes(values.code)) {
        errors["code"] = "Course code already exists in the other table";
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      setValidationErrors({});

      const newCourse = {
        id: new Date().toISOString(),
        code: values.code,
        credit: values.credit,
        ...(isRepeat
          ? { oldGrade: values.oldGrade, newGrade: values.newGrade }
          : { grade: values.grade }),
        semPoints: 0, // Calculate this value based on your logic
      };

      addAction(newCourse as GpaRepeatCourse | GpaNewCourse);

      table.setCreatingRow(null);
    };

  const handleSaveCourse: MRT_TableOptions<TableRow>["onEditingRowSave"] =
    async ({ values, table, row }) => {
      const errors = validate({
        values,
        data: tableData,
        method: "handleSave",
        isRepeat,
      });

      if (otherDataCodes.includes(values.code)) {
        errors["code"] = "Course code already exists in the other table";
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      if (!isRepeat) {
        if (
          values.code === row.original.code &&
          values.grade === row.original.grade &&
          values.credit === row.original.credit
        ) {
          table.setEditingRow(null);
          enqueueSnackbar("No changes made.", { variant: "info" });
          return;
        }
      } else {
        if (
          values.code === row.original.code &&
          values.oldGrade === row.original.oldGrade &&
          values.newGrade === row.original.newGrade &&
          values.credit === row.original.credit
        ) {
          table.setEditingRow(null);
          enqueueSnackbar("No changes made.", { variant: "info" });
          return;
        }
      }

      if (isRepeat) {
        const newRecord = {
          id: row.original.id,
          code: values.code,
          oldGrade: values.oldGrade,
          newGrade: values.newGrade,
          credit: values.credit,
        };
        updateAction(newRecord as GpaRepeatCourse);
      } else {
        const newRecord = {
          id: row.original.id,
          code: values.code,
          grade: values.grade,
          credit: values.credit,
        };
        updateAction(newRecord as GpaNewCourse);
      }

      table.setEditingRow(null);
    };

  const handleDeleteAction = (id: string) => {
    deleteAction(id, isRepeat); // Pass `isRepeat` when calling `deleteAction`
  };

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    editDisplayMode: "row",
    createDisplayMode: isRepeat ? "modal" : "row",
    enableEditing: true,
    getRowId: (row) => row.id,
    enableSorting: false,
    enableColumnActions: false,
    enablePagination: false,
    enableDensityToggle: false,
    enableFullScreenToggle: true,
    enableFilters: false,
    enableHiding: false,
    initialState: {
      density: "compact",
    },
    positionActionsColumn: "last",
    onCreatingRowSave: handleCreateCourse,
    onCreatingRowCancel: () => setValidationErrors({}),
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveCourse,
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h6" sx={{ textAlign: "center" }}>
          {isRepeat ? "Add a repeating course" : "Add a new course"}
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
    ),
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Edit Course</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {internalEditComponents}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: 0 }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon
              sx={{
                fontSize: "1rem",
              }}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            color="error"
            onClick={() => handleDeleteAction(row.original.id)}
          >
            <DeleteIcon
              sx={{
                fontSize: "1rem",
              }}
            />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => table.setCreatingRow(true)}
        sx={{ textTransform: "none" }}
      >
        {isRepeat ? "Add a repeating course" : "Add a new course"}
      </Button>
    ),
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
          <b>Semester GPA:</b> {semGpa.toFixed(2)}
        </Box>
      </Box>
    ),
    muiTableBodyCellProps: {
      sx: {
        borderRight: "0.5px solid",
        "&:first-of-type": {
          borderLeft: "0.5px solid",
        },
      },
    },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        borderRadius: "5px",
        border: `1px dotted ${
          theme.palette.mode === "dark" ? "#444242" : "#b3c0b3"
        }`,
      },
    },
    muiTableHeadCellProps: {
      sx: {
        backgroundColor: theme.palette.mode === "dark" ? "#444242" : "#b3c0b3",
        borderRight: "0.5px solid",
        "&:first-of-type": {
          borderLeft: "0.5px solid",
        },
        borderTop: "0.5px solid",
      },
    },
  });

  return <MaterialReactTable table={table} />;
};

export default CourseTable;

const validate = ({
  values,
  data,
  method,
  isRepeat,
}: {
  values: {
    code: string;
    credit: number;
    newGrade?: string;
    oldGrade?: string;
    grade?: string;
  };
  data: TableRow[];
  method: string;
  isRepeat: boolean;
}) => {
  const errors: Record<string, string> = {};

  // check if any of the required fields are empty

  if (!values.code) {
    errors["code"] = "Course code is required";
  }

  if (!values.credit) {
    errors["credit"] = "Credit is required";
  }

  if (isRepeat) {
    if (!values.oldGrade) {
      errors["oldGrade"] = "Old grade is required";
    }

    if (!values.newGrade) {
      errors["newGrade"] = "New grade is required";
    }
  } else {
    if (!values.grade) {
      errors["grade"] = "Grade is required";
    }
  }

  if (values.code.length !== 8) {
    errors["code"] = "Course code must be exactly 8 characters";
  }

  const codeRegExp = new RegExp("^[A-Z]{4}\\d{4}$");

  if (!codeRegExp.test(values.code)) {
    errors["code"] =
      "Course code must be 4 capital letters followed by 4 numbers";
  }

  if (values.credit < 0 || values.credit > 9) {
    errors["credit"] = "Credit cannot be less than 0 or more than 9";
  }

  const grades = [
    "A+",
    "A",
    "A-",
    "B+",
    "B",
    "B-",
    "C+",
    "C",
    "C-",
    "D+",
    "D",
    "F",
  ];

  if (
    isRepeat &&
    values.newGrade &&
    values.oldGrade &&
    grades.indexOf(values.newGrade) >= grades.indexOf(values.oldGrade)
  ) {
    errors["newGrade"] = "New grade must be higher than the old grade";
  }

  if (method === "handleCreate") {
    const duplicateCourse = data.find((course) => course.code === values.code);

    if (duplicateCourse) {
      errors["code"] = "Course code already exists";
    }
  }

  return errors;
};
