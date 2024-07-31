import { useEffect, useState } from "react";
import FirstTable from "components/FirstTable";
import CourseTable from "components/CourseTable";
import { Typography, Divider, Box } from "@mui/material";
import { useSnackbar } from "notistack";
import { gradeValueLabel as gradeLabels } from "constants/gradeValueLabel";
import {
  findCourse,
  calculateSemPointsAndPoints,
  calculateSemPoints,
} from "helpers";

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

export default function GpaCalculatorMain() {
  const [gpaRecord, setGpaRecord] = useState<GpaRecord>({
    semGpaRepeat: 0,
    semGpaNew: 0,
    currentGradePoints: 0,
    currentAttemptedCredits: 0,
    currentCGPA: 0,
    expectedGradePoints: 0,
    expectedAttemptedCredits: 0,
    expectedCGPA: 0,
    overallSemGpa: 0,
  });

  const [gpaRepeatCourses, setGpaRepeatCourses] = useState<GpaRepeatCourse[]>(
    []
  );
  const [gpaNewCourses, setGpaNewCourses] = useState<GpaNewCourse[]>([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteRecordID, setDeleteRecordID] = useState<string>("");
  const [isRepeat, setIsRepeat] = useState<boolean>(true); // Add this state

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    calculateGpaValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpaRepeatCourses, gpaNewCourses]);

  const calculateGpaValues = () => {
    const sumSemPointsRepeat = gpaRepeatCourses.reduce((acc, course) => {
      return acc + course.semPoints;
    }, 0);

    const sumCreditsRepeat = gpaRepeatCourses.reduce((acc, course) => {
      const credit = Number(course.credit);
      return acc + credit;
    }, 0);

    const sumSemPointsNew = gpaNewCourses.reduce((acc, course) => {
      console.log(`Adding ${course.semPoints} from course:`, course);
      return acc + course.semPoints;
    }, 0);

    const sumCreditsNew = gpaNewCourses.reduce((acc, course) => {
      const credit = Number(course.credit);
      console.log(`Adding ${credit} from course:`, course);
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
      sumSemPointsRepeat + sumSemPointsNew + gpaRecord.currentGradePoints;
    const expectedAttemptedCredits =
      sumCreditsNew + gpaRecord.currentAttemptedCredits;
    const expectedCGPA = expectedAttemptedCredits
      ? (expectedGradePoints / expectedAttemptedCredits).toFixed(2)
      : "0.00";

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
      if (
        findCourse(gpaNewCourses, course.code) ||
        gpaRepeatCourses.some(
          (c) => c.code === course.code && c.id !== course.id
        )
      ) {
        enqueueSnackbar(
          "Course already exists in the new course list or another repeat course",
          {
            variant: "error",
          }
        );
        return;
      }

      const { semPoints, points } = calculateSemPointsAndPoints(course);
      course.points = points;
      course.semPoints = semPoints;

      setGpaRepeatCourses((prevCourses) =>
        prevCourses.map((c) => (c.id === course.id ? course : c))
      );
    } else {
      if (
        findCourse(gpaRepeatCourses, course.code) ||
        gpaNewCourses.some((c) => c.code === course.code && c.id !== course.id)
      ) {
        enqueueSnackbar(
          "Course already exists in the repeat course list or another new course",
          {
            variant: "error",
          }
        );
        return;
      }

      const semPoints = calculateSemPoints(course);
      course.semPoints = semPoints;

      setGpaNewCourses((prevCourses) =>
        prevCourses.map((c) => (c.id === course.id ? course : c))
      );
    }
    calculateGpaValues(); // Recalculate GPA values immediately
  };

  const handleAddCourse = (course: GpaNewCourse | GpaRepeatCourse) => {
    if ("oldGrade" in course) {
      if (findCourse(gpaNewCourses, course.code)) {
        enqueueSnackbar("Course already exists in the new course list", {
          variant: "error",
        });
        return;
      }

      const { semPoints, points } = calculateSemPointsAndPoints(course);
      course.points = points;
      course.semPoints = semPoints;

      setGpaRepeatCourses((prevCourses) => [...prevCourses, course]);
    } else {
      if (findCourse(gpaRepeatCourses, course.code)) {
        enqueueSnackbar("Course already exists in the repeat course list", {
          variant: "error",
        });
        return;
      }

      const semPoints = calculateSemPoints(course);
      course.semPoints = semPoints;

      setGpaNewCourses((prevCourses) => [...prevCourses, course]);
    }
    calculateGpaValues(); // Recalculate GPA values immediately
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
    calculateGpaValues(); // Recalculate GPA values immediately
  };

  const openDeleteConfirmModal = (id: string, isRepeat: boolean) => {
    setDeleteRecordID(id);
    setDeleteDialogOpen(true);
    setIsRepeat(isRepeat); // Add this line to set the `isRepeat` state
  };

  return (
    <Box sx={{ display: "flex", width: "100%", overflowX: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          padding: "2rem",
          overflowX: "hidden",
        }}
      >
        <Box sx={{ overflowX: "auto", width: "100%" }}>
          <Typography variant="h5" align="center" sx={{ margin: "2rem 0" }}>
            GPA Calculator
          </Typography>
          <FirstTable gpaRecord={gpaRecord} setGpaRecord={setGpaRecord} />
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
            data={gpaRepeatCourses}
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
            data={gpaNewCourses}
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
        deleteAction={handleDeleteCourse} // Use correct delete action
        isRepeat={isRepeat} // Pass isRepeat flag
      />
    </Box>
  );
}
