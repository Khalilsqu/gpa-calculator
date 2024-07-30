export interface GradeValueLabel {
  value: number;
  label: string;
}

export const gradeValueLabel: GradeValueLabel[] = [
  { value: 4, label: "A" },
  { value: 3.7, label: "A-" },
  { value: 3.3, label: "B+" },
  { value: 3, label: "B" },
  { value: 2.7, label: "B-" },
  { value: 2.3, label: "C+" },
  { value: 2, label: "C" },
  { value: 1.7, label: "C-" },
  { value: 1.3, label: "D+" },
  { value: 1, label: "D" },
  { value: 0, label: "F" },
];
