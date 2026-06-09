// TODO: [API] GET /api/classrooms/:id/students
import type { Student } from "@/types";

export const mockStudents: Student[] = [
  { id: "stu-1", fullName: "Ana Clara Souza", email: "ana.souza@escola.edu.br", birthDate: "2011-03-15", classroomId: "cls-1" },
  { id: "stu-2", fullName: "Bruno Ferreira Lima", email: "bruno.lima@escola.edu.br", birthDate: "2011-07-22", classroomId: "cls-1" },
  { id: "stu-3", fullName: "Camila Rodrigues", email: "camila.rodrigues@escola.edu.br", birthDate: "2011-01-09", classroomId: "cls-1" },
  { id: "stu-4", fullName: "Daniel Oliveira Costa", email: "daniel.costa@escola.edu.br", birthDate: "2011-11-30", classroomId: "cls-1" },
  { id: "stu-5", fullName: "Eduarda Martins", email: "eduarda.martins@escola.edu.br", birthDate: "2011-05-18", classroomId: "cls-1" },
  { id: "stu-6", fullName: "Felipe Santos Rocha", email: "felipe.rocha@escola.edu.br", birthDate: "2011-08-04", classroomId: "cls-1" },
  { id: "stu-7", fullName: "Gabriela Nunes", email: "gabriela.nunes@escola.edu.br", birthDate: "2011-02-14", classroomId: "cls-1" },
  { id: "stu-8", fullName: "Hugo Pereira Alves", email: "hugo.alves@escola.edu.br", birthDate: "2011-09-27", classroomId: "cls-1" },
  { id: "stu-9", fullName: "Isabela Torres", email: "isabela.torres@escola.edu.br", birthDate: "2011-12-03", classroomId: "cls-1" },
  { id: "stu-10", fullName: "João Vitor Carvalho", email: "joao.carvalho@escola.edu.br", birthDate: "2011-06-19", classroomId: "cls-1" },
];
