import { useState } from "react";
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
  useMediaQuery,
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
  const isSmallScreen = useMediaQuery(theme.breakpoints.up("sm"));

  const gpaRecord = {
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
  } as GpaRecord;

  const gpaRepeatCourses = JSON.parse(
    searchParams.get("gpaRepeatCourses") || "[]"
  ) as GpaRepeatCourse[];
  const gpaNewCourses = JSON.parse(
    searchParams.get("gpaNewCourses") || "[]"
  ) as GpaNewCourse[];

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteRecordID, setDeleteRecordID] = useState<string>("");
  const [isRepeat, setIsRepeat] = useState<boolean>(true);

  const [resetDialogOpen, setResetDialogOpen] = useState<boolean>(false);

  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const { enqueueSnackbar } = useSnackbar();

  const handleUpdateCourse = (course: GpaNewCourse | GpaRepeatCourse) => {
    if ("oldGrade" in course) {
      const { semPoints, points } = calculateSemPointsAndPoints(course);
      course.points = points;
      course.semPoints = semPoints;
      const updatedCourses = gpaRepeatCourses.map((c) =>
        c.id === course.id ? course : c
      );

      searchParams.set("gpaRepeatCourses", JSON.stringify(updatedCourses));
      setSearchParams(searchParams);
    } else {
      const semPoints = calculateSemPoints(course);
      course.semPoints = semPoints;
      const updatedCourses = gpaNewCourses.map((c) =>
        c.id === course.id ? course : c
      );

      searchParams.set("gpaNewCourses", JSON.stringify(updatedCourses));
      setSearchParams(searchParams);
    }

    calculateGpaValues();

    setHasChanges(true);

    enqueueSnackbar(`Course ${course.code} updated successfully`, {
      variant: "success",
    });
  };

  const handleAddCourse = (course: GpaNewCourse | GpaRepeatCourse) => {
    // prevent adding more than a total of 9 courses in both repeat and new courses

    if (gpaRepeatCourses.length + gpaNewCourses.length >= 9) {
      enqueueSnackbar(
        "You have reached the maximum number of courses allowed (9)",
        {
          variant: "error",
          autoHideDuration: 15000,
          SnackbarProps: {
            onClick: () => {
              closeSnackbar();
            },
          },
        }
      );
      return;
    }
    if ("oldGrade" in course) {
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
            autoHideDuration: 15000,
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

      searchParams.set(
        "gpaRepeatCourses",
        JSON.stringify([...gpaRepeatCourses, course])
      );

      setSearchParams(searchParams);
    } else {
      const semPoints = calculateSemPoints(course);
      course.semPoints = semPoints;

      searchParams.set(
        "gpaNewCourses",
        JSON.stringify([...gpaNewCourses, course])
      );
      setSearchParams(searchParams);
    }

    calculateGpaValues();

    setHasChanges(true);

    enqueueSnackbar(`Course ${course.code} added successfully`, {
      variant: "success",
    });
  };

  const handleDeleteCourse = (id: string, isRepeat: boolean) => {
    if (isRepeat) {
      searchParams.set(
        "gpaRepeatCourses",
        JSON.stringify(gpaRepeatCourses.filter((c) => c.id !== id))
      );

      setSearchParams(searchParams);
    } else {
      searchParams.set(
        "gpaNewCourses",
        JSON.stringify(gpaNewCourses.filter((c) => c.id !== id))
      );

      setSearchParams(searchParams);
    }

    calculateGpaValues();
    enqueueSnackbar("Course deleted successfully", { variant: "success" });
    setHasChanges(true);
  };

  const openDeleteConfirmModal = (id: string, isRepeat: boolean) => {
    setDeleteRecordID(id);
    setDeleteDialogOpen(true);
    setIsRepeat(isRepeat);
  };

  const handleReset = () => {
    searchParams.set("semGpaRepeat", "0");
    searchParams.set("semGpaNew", "0");
    searchParams.set("overallSemGpa", "0");
    searchParams.set("expectedGradePoints", "0");
    searchParams.set("expectedAttemptedCredits", "0");
    searchParams.set("expectedCGPA", "0");
    searchParams.set("currentGradePoints", "0");
    searchParams.set("currentAttemptedCredits", "0");
    searchParams.set("currentCGPA", "0");

    searchParams.set("gpaRepeatCourses", JSON.stringify([]));
    searchParams.set("gpaNewCourses", JSON.stringify([]));

    setSearchParams(searchParams);
    enqueueSnackbar("All data has been reset", { variant: "success" });
    setResetDialogOpen(false);
    setHasChanges(false);
  };

  const calculateGpaValues = () => {
    // Re-fetch gpaRecord from searchParams to ensure it's up-to-date
    const gpaRecord = {
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

    const gpaRepeatCourses = JSON.parse(
      searchParams.get("gpaRepeatCourses") || "[]"
    ) as GpaRepeatCourse[];

    const gpaNewCourses = JSON.parse(
      searchParams.get("gpaNewCourses") || "[]"
    ) as GpaNewCourse[];

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

    searchParams.set("semGpaRepeat", semGpaRepeat.toString());
    searchParams.set("semGpaNew", semGpaNew.toString());
    searchParams.set("overallSemGpa", overallSemGpa.toString());
    searchParams.set("expectedGradePoints", expectedGradePoints.toString());
    searchParams.set(
      "expectedAttemptedCredits",
      expectedAttemptedCredits.toString()
    );
    searchParams.set("expectedCGPA", expectedCGPA.toString());
    setSearchParams(searchParams);
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
            repeatCredits={gpaRepeatCourses.reduce((acc, course) => {
              return acc + Number(course.credit);
            }, 0)}
            newCredits={gpaNewCourses.reduce((acc, course) => {
              return acc + Number(course.credit);
            }, 0)}
            setHasChanges={setHasChanges}
          />
          <Divider
            textAlign={isSmallScreen ? "center" : "left"}
            sx={{
              marginY: "2rem",
              paddingTop: "40px",
              fontFamily: "Arial, sans-serif",
              fontSize: "16px",
              color: "red",
              "::before, ::after": {
                borderWidth: { xs: "3px", sm: "5px" },
              },
            }}
          >
            <Typography
              variant="body1"
              sx={{
                border: "1px dotted black",
                padding: "5px",
                borderRadius: "5px",
                fontSize: { xs: "0.8rem", sm: "1rem" },
              }}
            >
              Repeat Courses
            </Typography>
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
            textAlign={isSmallScreen ? "center" : "left"}
            sx={{
              marginY: "2rem",
              paddingTop: "40px",
              fontFamily: "Arial, sans-serif",
              fontSize: "16px",
              color: "red",
              "::before, ::after": {
                borderWidth: { xs: "3px", sm: "5px" },
              },
            }}
          >
            {/* New Courses */}
            <Typography
              variant="body1"
              sx={{
                border: "1px dotted black",
                padding: "5px",
                borderRadius: "5px",
                fontSize: { xs: "0.8rem", sm: "1rem" },
              }}
            >
              New Courses
            </Typography>
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
