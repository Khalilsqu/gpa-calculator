import { useState } from "react";

import FirstTable from "components/FirstTable";

// import CourseTable from "components/CourseTable";
import { Typography, Divider, Box } from "@mui/material";
// import { enqueueSnackbar, closeSnackbar } from "notistack";

// import { gradeValueLabel as gradeLabels } from "constants/gradeValueLabel";

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

  // const [gpaRepeatCourse, setGpaRepeatCourse] = useState<GpaRepeatCourse[]>([]);
  // const [gpaNewCourse, setGpaNewCourse] = useState<GpaNewCourse[]>([]);

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        overflowX: "hidden",
      }}
    >
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
          {/* <Divider textAlign="center" sx={{ marginY: "2rem", paddingTop: "40px" }}>
        Repeating Courses
      </Divider>
      <CourseTable
        isRepeat={true}
        data={gpaRepeatCourse}
        semGpa={gpaRecord.semGpaRepeat}
        gpaRecordId={gpaRecord.id}
        gradeLabels={gradeLabels}
      />
      <Divider textAlign="center" sx={{ marginY: "2rem", paddingTop: "40px" }}>
        New Courses
      </Divider>
      <CourseTable
        isRepeat={false}
        data={gpaNewCourse}
        semGpa={gpaRecord.semGpaNew}
        gpaRecordId={gpaRecord.id}
        gradeLabels={gradeLabels}
      /> */}
        </Box>
      </Box>
    </Box>
  );
}
