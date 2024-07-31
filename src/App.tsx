import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FirstTable from "components/FirstTable";
import CourseTable from "components/CourseTable";
import { Typography, Divider, Box } from "@mui/material";
import { useSnackbar } from "notistack";
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

export default function GpaCalculatorMain() {
  const [searchParams, setSearchParams] = useSearchParams();

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
    calculateGpaValues();
  };

  const handleAddCourse = (course: GpaNewCourse | GpaRepeatCourse) => {
    if ("oldGrade" in course) {
      const { semPoints, points } = calculateSemPointsAndPoints(course);
      course.points = points;
      course.semPoints = semPoints;

      setGpaRepeatCourses((prevCourses) => [...prevCourses, course]);
    } else {
      const semPoints = calculateSemPoints(course);
      course.semPoints = semPoints;

      setGpaNewCourses((prevCourses) => [...prevCourses, course]);
    }
    calculateGpaValues();
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
    calculateGpaValues();
  };

  const openDeleteConfirmModal = (id: string, isRepeat: boolean) => {
    setDeleteRecordID(id);
    setDeleteDialogOpen(true);
    setIsRepeat(isRepeat);
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
            otherDataCodes={gpaNewCourses.map((c) => c.code)}
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
            otherDataCodes={gpaRepeatCourses.map((c) => c.code)}
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
    </Box>
  );
}
