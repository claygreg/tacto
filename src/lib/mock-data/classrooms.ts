// TODO: [API] GET /api/classrooms
import type { Classroom } from "@/types";

export const mockClassrooms: Classroom[] = [
  {
    id: "cls-1",
    name: "9º Ano A",
    year: 2026,
    subject: "Matemática",
    studentCount: 32,
    assessmentCount: 4,
    archived: false,
  },
  {
    id: "cls-2",
    name: "8º Ano B",
    year: 2026,
    subject: "Ciências",
    studentCount: 28,
    assessmentCount: 2,
    archived: false,
  },
  {
    id: "cls-3",
    name: "7º Ano C",
    year: 2026,
    subject: "Português",
    studentCount: 35,
    assessmentCount: 3,
    archived: false,
  },
  {
    id: "cls-4",
    name: "6º Ano A",
    year: 2025,
    subject: "História",
    studentCount: 30,
    assessmentCount: 5,
    archived: true,
  },
];
