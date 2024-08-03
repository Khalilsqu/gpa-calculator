import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FirstTable from "components/FirstTable";
import CourseTable from "components/CourseTable";
import {
  Typography,
  Divider,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useSnackbar, closeSnackbar } from "notistack";
import { gradeValueLabel as gradeLabels } from "constants/gradeValueLabel";
import { calculateSemPointsAndPoints, calculateSemPoints } from "helpers";
import DeleteDialogTable from "components/DeleteDialogTable";

export interface GpaRecord {
  semGpaRepeat: number;
  semGpaNew: number;
  currentGradePoints: number;
  currentAttemptedCredits: number;
  currentCGPA: number;
  expectedGradePoints: number;
  expectedAttemptedCredits: number;
  expectedCGPA: number;
  overallSemGpa: number;
}

export interface GpaRepeatCourse {
  id: string;
  code: string;
  oldGrade: string;
  newGrade: string;
  credit: number;
  points: number;
  semPoints: number;
}

export interface GpaNewCourse {
  id: string;
  code: string;
  grade: string;
  credit: number;
  semPoints: number;
}

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const theme = useTheme();

  const initialGpaRecord = {
    semGpaRepeat: Number(searchParams.get("semGpaRepeat")) || 0,
    semGpaNew: Number(searchParams.get("semGpaNew")) || 0,
    currentGradePoints: Number(searchParams.get("currentGradePoints")) || 0,
    currentAttemptedCredits:
      Number(searchParams.get("currentAttemptedCredits")) || 0,
    currentCGPA: Number(searchParams.get("currentCGPA")) || 0,
    expectedGradePoints: Number(searchParams.get("expectedGradePoints")) || 0,
    expectedAttemptedCredits:
      Number(searchParams.get("expectedAttemptedCredits")) || 0,
    expectedCGPA: Number(searchParams.get("expectedCGPA")) || 0,
    overallSemGpa: Number(searchParams.get("overallSemGpa")) || 0,
  };

  const initialGpaRepeatCourses = JSON.parse(
    searchParams.get("gpaRepeatCourses") || "[]"
  );
  const initialGpaNewCourses = JSON.parse(
    searchParams.get("gpaNewCourses") || "[]"
  );

  const [gpaRecord, setGpaRecord] = useState<GpaRecord>(initialGpaRecord);
  const [gpaRepeatCourses, setGpaRepeatCourses] = useState<GpaRepeatCourse[]>(
    initialGpaRepeatCourses
  );
  const [gpaNewCourses, setGpaNewCourses] =
    useState<GpaNewCourse[]>(initialGpaNewCourses);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteRecordID, setDeleteRecordID] = useState<string>("");
  const [isRepeat, setIsRepeat] = useState<boolean>(true);

  const [resetDialogOpen, setResetDialogOpen] = useState<boolean>(false);

  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    calculateGpaValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpaRepeatCourses, gpaNewCourses]);

  useEffect(() => {
    const params = {
      ...Object.keys(gpaRecord).reduce((acc: Record<string, string>, key) => {
        acc[key] = gpaRecord[key as keyof GpaRecord].toString();
        return acc;
      }, {}),
      gpaRepeatCourses: JSON.stringify(gpaRepeatCourses),
      gpaNewCourses: JSON.stringify(gpaNewCourses),
    };
    setSearchParams(params);
  }, [gpaRecord, gpaRepeatCourses, gpaNewCourses, setSearchParams]);

  const calculateGpaValues = () => {
    const sumSemPointsRepeat = gpaRepeatCourses.reduce((acc, course) => {
      return acc + course.semPoints;
    }, 0);

    const sumPointsRepeat = gpaRepeatCourses.reduce((acc, course) => {
      return acc + course.points;
    }, 0);

    const sumCreditsRepeat = gpaRepeatCourses.reduce((acc, course) => {
      const credit = Number(course.credit);
      return acc + credit;
    }, 0);

    const sumSemPointsNew = gpaNewCourses.reduce((acc, course) => {
      return acc + course.semPoints;
    }, 0);

    const sumCreditsNew = gpaNewCourses.reduce((acc, course) => {
      const credit = Number(course.credit);
      return acc + credit;
    }, 0);

    const semGpaRepeat = sumCreditsRepeat
      ? sumSemPointsRepeat / sumCreditsRepeat
      : 0;

    const semGpaNew = sumCreditsNew ? sumSemPointsNew / sumCreditsNew : 0;

    const totalSemPoints = sumSemPointsRepeat + sumSemPointsNew;
    const totalCredits = sumCreditsRepeat + sumCreditsNew;

    const overallSemGpa = totalCredits ? totalSemPoints / totalCredits : 0;

    const expectedGradePoints =
      sumPointsRepeat + sumSemPointsNew + gpaRecord.currentGradePoints;
    const expectedAttemptedCredits =
      sumCreditsNew + gpaRecord.currentAttemptedCredits;

    let expectedCGPA = expectedAttemptedCredits
      ? (expectedGradePoints / expectedAttemptedCredits).toFixed(2)
      : "0.00";

    if (
      Number(expectedAttemptedCredits) === 0 ||
      isNaN(parseFloat(expectedCGPA))
    ) {
      expectedCGPA = "0.00";
    }

    setGpaRecord((prevRecord) => ({
      ...prevRecord,
      semGpaRepeat: semGpaRepeat,
      semGpaNew: semGpaNew,
      overallSemGpa: overallSemGpa,
      expectedGradePoints: expectedGradePoints,
      expectedAttemptedCredits: expectedAttemptedCredits,
      expectedCGPA: parseFloat(expectedCGPA),
    }));
  };

  const handleUpdateCourse = (course: GpaNewCourse | GpaRepeatCourse) => {
    if ("oldGrade" in course) {
      const { semPoints, points } = calculateSemPointsAndPoints(course);
      course.points = points;
      course.semPoints = semPoints;

      setGpaRepeatCourses((prevCourses) =>
        prevCourses.map((c) => (c.id === course.id ? course : c))
      );
    } else {
      const semPoints = calculateSemPoints(course);
      course.semPoints = semPoints;

      setGpaNewCourses((prevCourses) =>
        prevCourses.map((c) => (c.id === course.id ? course : c))
      );
    }

    setHasChanges(true);

    enqueueSnackbar(`Course ${course.code} updated successfully`, {
      variant: "success",
    });
  };

  const handleAddCourse = (course: GpaNewCourse | GpaRepeatCourse) => {
    if ("oldGrade" in course) {
      // do not allow adding a repeat course if the ((current credits attempted - credits of the courses in the repeat table) - credits of the course being added) < 0

      const sumCreditsRepeat = gpaRepeatCourses.reduce((acc, course) => {
        const credit = Number(course.credit);
        return acc + credit;
      }, 0);

      const currentAttemptedCredits = Number(gpaRecord.currentAttemptedCredits);

      if (
        currentAttemptedCredits - (sumCreditsRepeat + Number(course.credit)) <
        0
      ) {
        enqueueSnackbar(
          `Sum of credits of repeat courses and the course being added exceeds the current attempted credits (${currentAttemptedCredits})`,
          {
            variant: "error",
            autoHideDuration: 10000,
            SnackbarProps: {
              onClick: () => {
                closeSnackbar();
              },
            },
          }
        );
        return;
      }

      const { semPoints, points } = calculateSemPointsAndPoints(course);
      course.points = points;
      course.semPoints = semPoints;

      setGpaRepeatCourses((prevCourses) => [...prevCourses, course]);
    } else {
      const semPoints = calculateSemPoints(course);
      course.semPoints = semPoints;

      setGpaNewCourses((prevCourses) => [...prevCourses, course]);
    }

    setHasChanges(true);

    enqueueSnackbar(`Course ${course.code} added successfully`, {
      variant: "success",
    });
  };

  const handleDeleteCourse = (id: string, isRepeat: boolean) => {
    if (isRepeat) {
      setGpaRepeatCourses((prevCourses) =>
        prevCourses.filter((c) => c.id !== id)
      );
    } else {
      setGpaNewCourses((prevCourses) => prevCourses.filter((c) => c.id !== id));
    }
    enqueueSnackbar("Course deleted successfully", { variant: "success" });
    setHasChanges(true);
  };

  const openDeleteConfirmModal = (id: string, isRepeat: boolean) => {
    setDeleteRecordID(id);
    setDeleteDialogOpen(true);
    setIsRepeat(isRepeat);
  };

  const handleReset = () => {
    const newGpaRecord = {
      semGpaRepeat: 0,
      semGpaNew: 0,
      currentGradePoints: 0,
      currentAttemptedCredits: 0,
      currentCGPA: 0,
      expectedGradePoints: 0,
      expectedAttemptedCredits: 0,
      expectedCGPA: 0,
      overallSemGpa: 0,
    };
    setGpaRecord(newGpaRecord);
    setGpaRepeatCourses([]);
    setGpaNewCourses([]);

    const initialParams = {
      ...Object.keys(newGpaRecord).reduce(
        (acc: Record<string, string>, key) => {
          acc[key] = newGpaRecord[key as keyof GpaRecord].toString();
          return acc;
        },
        {}
      ),
      gpaRepeatCourses: JSON.stringify([]),
      gpaNewCourses: JSON.stringify([]),
    };

    setSearchParams(initialParams);
    enqueueSnackbar("All data has been reset", { variant: "success" });
    setResetDialogOpen(false);
    setHasChanges(false);
  };

  return (
    <Box sx={{ display: "flex", width: "100%", overflowX: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          padding: { xs: "0.7rem", sm: "2rem" },
          overflowX: "hidden",
        }}
      >
        {hasChanges ? (
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
              onClick={() => setResetDialogOpen(true)}
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
        )}
        <Box sx={{ overflowX: "auto", width: "100%" }}>
          <FirstTable
            gpaRecord={gpaRecord}
            setGpaRecord={setGpaRecord}
            repeatCredits={gpaRepeatCourses.reduce((acc, course) => {
              return acc + Number(course.credit);
            }, 0)}
            newCredits={gpaNewCourses.reduce((acc, course) => {
              return acc + Number(course.credit);
            }, 0)}
            setHasChanges={setHasChanges}
          />
          <Divider
            textAlign="center"
            sx={{
              marginY: "2rem",
              paddingTop: "40px",
              fontFamily: "Arial, sans-serif",
              fontSize: "16px",
              color: "red",
            }}
          >
            Repeating Courses
          </Divider>
          <CourseTable
            isRepeat={true}
            repeatData={gpaRepeatCourses}
            newData={gpaNewCourses}
            gpaRecord={gpaRecord}
            semGpa={gpaRecord.semGpaRepeat}
            gradeLabels={gradeLabels}
            updateAction={handleUpdateCourse}
            addAction={handleAddCourse}
            deleteAction={openDeleteConfirmModal}
          />
          <Divider
            textAlign="center"
            sx={{
              marginY: "2rem",
              paddingTop: "40px",
              fontFamily: "Arial, sans-serif",
              fontSize: "16px",
              color: "red",
            }}
          >
            New Courses
          </Divider>
          <CourseTable
            isRepeat={false}
            repeatData={gpaRepeatCourses}
            newData={gpaNewCourses}
            gpaRecord={gpaRecord}
            semGpa={gpaRecord.semGpaNew}
            gradeLabels={gradeLabels}
            updateAction={handleUpdateCourse}
            addAction={handleAddCourse}
            deleteAction={openDeleteConfirmModal}
          />
        </Box>
      </Box>
      <DeleteDialogTable
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        recordID={deleteRecordID}
        deleteAction={handleDeleteCourse}
        isRepeat={isRepeat}
      />
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Reset All Data</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Repeat and new courses will be deleted. GPA records will be set to
            0. Are you sure you want to reset all data?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReset} color="primary">
            Reset
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
