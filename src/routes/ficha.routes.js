import { Router } from "express";
import { getFichaEstudiante, saveOrUpdateFicha, deleteFicha } from "../controllers/ficha.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/fichas/:estudiante_id/:codigo_ficha", verifyToken, getFichaEstudiante);
router.post("/fichas/guardar", verifyToken, saveOrUpdateFicha);
router.delete("/fichas/:estudiante_id/:codigo_ficha", verifyToken, deleteFicha);

export default router;