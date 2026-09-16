import { Router } from "express";
import {
  getCentralizador_1erAno,
  updateFechaCentralizador_1erAno
} from "../../../controllers/fichas/1año/centralizador_1erAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/1er-ano/centralizador/:estudiante_id", verifyToken, getCentralizador_1erAno);
router.post("/1er-ano/centralizador/guardar-fecha", verifyToken, updateFechaCentralizador_1erAno);

export default router;