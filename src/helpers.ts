import { gradeValueLabel as gradeLabels } from "constants/gradeValueLabel";
import { GpaNewCourse, GpaRepeatCourse } from "App";


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
