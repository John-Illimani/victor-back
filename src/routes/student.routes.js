import { Router } from "express";
import { 
  getStudents, 
  createStudent, 
  updateStudent, 
  toggleStudentStatus, 
  deleteStudent, 
  deleteMultipleStudents, 
  importBatchStudents 
} from "../controllers/student.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/estudiantes", verifyToken, getStudents);
router.post("/estudiantes", verifyToken, createStudent);
router.put("/estudiantes/:id", verifyToken, updateStudent);
router.patch("/estudiantes/:id/status", verifyToken, toggleStudentStatus);
router.delete("/estudiantes/:id", verifyToken, deleteStudent);
router.post("/estudiantes/delete-batch", verifyToken, deleteMultipleStudents);
router.post("/estudiantes/import-batch", verifyToken, importBatchStudents);

export default router;