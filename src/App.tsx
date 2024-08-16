import { useState } from "react";
import FirstTable from "components/FirstTable";
import CourseTable from "components/CourseTable";
import { Typography, Divider, Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useSnackbar, closeSnackbar } from "notistack";
import { gradeValueLabel as gradeLabels } from "constants/gradeValueLabel";
import { calculateSemPointsAndPoints, calculateSemPoints } from "helpers";
import DeleteDialogTable from "components/DeleteDialogTable";
import ResetDialog from "components/ResetDialog";
import Header from "components/Header";
import { useGpaCalculator } from "hooks/useGpaCalculator";

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
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.up("sm"));

  const {
    gpaRecord,
    gpaRepeatCourses,
    gpaNewCourses,
    calculateGpaValues,
    searchParams,
    setSearchParams,
  } = useGpaCalculator();

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
        <Header
          hasChanges={hasChanges}
          onReset={() => setResetDialogOpen(true)}
        />
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
      <ResetDialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        onReset={handleReset}
      />
    </Box>
  );
}
