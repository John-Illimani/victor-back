import { Router } from "express";
import { 
  getGuides, 
  createGuide, 
  updateGuide, 
  deleteGuide, 
  deleteMultipleGuides, 
  importBatchGuides,
  getAssignedStudents,
  assignStudentToGuide,
  unassignStudentFromGuide,
  toggleFormularioGuide
} from "../controllers/guide.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/docentes-guia", verifyToken, getGuides);
router.post("/docentes-guia", verifyToken, createGuide);
router.put("/docentes-guia/:id", verifyToken, updateGuide);
router.delete("/docentes-guia/:id", verifyToken, deleteGuide);
router.post("/docentes-guia/delete-batch", verifyToken, deleteMultipleGuides);
router.post("/docentes-guia/import-batch", verifyToken, importBatchGuides);

router.get("/docentes-guia/:id/estudiantes", verifyToken, getAssignedStudents);
router.post("/docentes-guia/asignar-estudiante", verifyToken, assignStudentToGuide);
router.post("/docentes-guia/desasignar-estudiante", verifyToken, unassignStudentFromGuide);

// Ruta para habilitar/deshabilitar formularios al Docente Guía
router.patch("/docentes-guia/toggle-formulario-docente", verifyToken, toggleFormularioGuide);

export default router;