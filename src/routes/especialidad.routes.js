import { Router } from "express";
import {
  getEspecialidades,
  createEspecialidad,
  updateEspecialidad,
  deleteEspecialidad
} from "../controllers/especialidad.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/especialidades", verifyToken, getEspecialidades);
router.post("/especialidades", verifyToken, createEspecialidad);
router.put("/especialidades/:id", verifyToken, updateEspecialidad);
router.delete("/especialidades/:id", verifyToken, deleteEspecialidad);

export default router;