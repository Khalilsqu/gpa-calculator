// useGpaCalculator.ts
import { useSearchParams } from "react-router-dom";
import type { GpaRecord, GpaRepeatCourse, GpaNewCourse } from "App";

export const useGpaCalculator = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const gpaRecord: GpaRecord = {
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

  const gpaRepeatCourses: GpaRepeatCourse[] = JSON.parse(
    searchParams.get("gpaRepeatCourses") || "[]"
  );
  const gpaNewCourses: GpaNewCourse[] = JSON.parse(
    searchParams.get("gpaNewCourses") || "[]"
  );

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

  return {
    gpaRecord,
    gpaRepeatCourses,
    gpaNewCourses,
    calculateGpaValues,
    searchParams,
    setSearchParams,
  };
};
