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
  const sumOldPointsRepeat = gpaRepeatCourses.reduce((acc, course) => {
    return acc + course.points;
  }, 0);

  const sumOldSemPointsNew = gpaNewCourses.reduce((acc, course) => {
    return acc + course.semPoints;
  }, 0);

  const sumOldCreditsNew = gpaNewCourses.reduce((acc, course) => {
    const credit = Number(course.credit);
    return acc + credit;
  }, 0);

  let newPoints = Number(gpaRecord.currentGradePoints);
  let newCredits = Number(gpaRecord.currentAttemptedCredits);

  if ("oldGrade" in newCourse) {
    const { points } = calculateSemPointsAndPoints(newCourse);

    if (isUpdate) {
      const oldCourse = gpaRepeatCourses.find(
        (course) => course.id === newCourse.id
      );
      if (oldCourse) {
        newPoints -= oldCourse.points;
        newPoints += points;
      }
    } else {
      newPoints += points;
    }
  } else {
    const semPoints = calculateSemPoints(newCourse);
    if (isUpdate) {
      const oldCourse = gpaNewCourses.find(
        (course) => course.id === newCourse.id
      );
      if (oldCourse) {
        newPoints -= oldCourse.semPoints;
        newCredits -= Number(oldCourse.credit);
        newPoints += semPoints;
        newCredits += Number(newCourse.credit);
      }
    } else {
      newPoints += semPoints;
      newCredits += Number(newCourse.credit);
    }
  }

  const allPoints = sumOldPointsRepeat + sumOldSemPointsNew + newPoints;
  const allCredits = sumOldCreditsNew + newCredits;

  if (allCredits === 0) {
    return false;
  }

  const newCGPA = allPoints / allCredits;

  return newCGPA > 4;
};
