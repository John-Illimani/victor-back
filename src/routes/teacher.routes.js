import { Router } from "express";
import { 
  getTeachers, 
  createTeacher, 
  updateTeacher, 
  deleteTeacher, 
  deleteMultipleTeachers, 
  importBatchTeachers,
  getAssignedStudents,
  assignStudentToTeacher,
  unassignStudentFromTeacher,
  toggleFormularioDocente
} from "../controllers/teacher.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/docentes-acompanantes", verifyToken, getTeachers);
router.post("/docentes-acompanantes", verifyToken, createTeacher);
router.put("/docentes-acompanantes/:id", verifyToken, updateTeacher);
router.delete("/docentes-acompanantes/:id", verifyToken, deleteTeacher);
router.post("/docentes-acompanantes/delete-batch", verifyToken, deleteMultipleTeachers);
router.post("/docentes-acompanantes/import-batch", verifyToken, importBatchTeachers);

router.get("/docentes-acompanantes/:id/estudiantes", verifyToken, getAssignedStudents);
router.post("/docentes-acompanantes/asignar-estudiante", verifyToken, assignStudentToTeacher);
router.post("/docentes-acompanantes/desasignar-estudiante", verifyToken, unassignStudentFromTeacher);

// Ruta para habilitar/deshabilitar formularios al docente
router.patch("/docentes-acompanantes/toggle-formulario-docente", verifyToken, toggleFormularioDocente);

export default router;