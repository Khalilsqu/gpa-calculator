import { GpaNewCourse, GpaRepeatCourse, GpaRecord } from "App";
import { gradeValueLabel as gradeLabels } from "constants/gradeValueLabel";

export const calculateSemPointsAndPoints = (course: GpaRepeatCourse) => {
  const gradeValueNew = gradeLabels.find((g) => g.label === course.newGrade);
  const gradeValueOld = gradeLabels.find((g) => g.label === course.oldGrade);

  const semPoints = gradeValueNew ? gradeValueNew.value * course.credit : 0;

  let points = 0;
  if (gradeValueOld) {
    points = semPoints - gradeValueOld.value * course.credit;
  }

  points = parseFloat(points.toFixed(2));

  return { semPoints, points };
};

export const calculateSemPoints = (course: GpaNewCourse) => {
  const gradeValue = gradeLabels.find((g) => g.label === course.grade);
  return gradeValue ? gradeValue.value * course.credit : 0;
};

export const willExceedMaxCGPA = (
  gpaRecord: GpaRecord,
  newCourse: GpaRepeatCourse | GpaNewCourse,
  gpaRepeatCourses: GpaRepeatCourse[],
  gpaNewCourses: GpaNewCourse[],
  isUpdate: boolean = false
): boolean => {
  let expectedGradePoints = Number(gpaRecord.currentGradePoints);
  let expectedAttemptedCredits = Number(gpaRecord.currentAttemptedCredits);

  gpaRepeatCourses.forEach((course) => {
    const { semPoints } = calculateSemPointsAndPoints(course);
    expectedGradePoints += Number(semPoints);
    // Do not add course credit to expectedAttemptedCredits
  });

  gpaNewCourses.forEach((course) => {
    const semPoints = calculateSemPoints(course);
    expectedGradePoints += Number(semPoints);
    expectedAttemptedCredits += Number(course.credit);
  });

  if ("oldGrade" in newCourse) {
    const { semPoints } = calculateSemPointsAndPoints(newCourse);
    if (isUpdate) {
      const oldCourse = gpaRepeatCourses.find(
        (course) => course.id === newCourse.id
      );
      if (oldCourse) {
        expectedGradePoints -= Number(oldCourse.semPoints);
        // Do not subtract course credit from expectedAttemptedCredits
      }
    }
    expectedGradePoints += Number(semPoints);
    // Do not add course credit to expectedAttemptedCredits
  } else {
    const semPoints = calculateSemPoints(newCourse);
    if (isUpdate) {
      const oldCourse = gpaNewCourses.find(
        (course) => course.id === newCourse.id
      );
      if (oldCourse) {
        expectedGradePoints -= Number(oldCourse.semPoints);
        expectedAttemptedCredits -= Number(oldCourse.credit);
      }
    }
    expectedGradePoints += Number(semPoints);
    expectedAttemptedCredits += Number(newCourse.credit);
  }

  const expectedCGPA = expectedAttemptedCredits
    ? expectedGradePoints / expectedAttemptedCredits
    : 0;

  return expectedCGPA > 4.0;
};
