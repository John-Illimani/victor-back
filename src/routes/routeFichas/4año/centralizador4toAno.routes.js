import { Router } from "express";
import {
  getCentralizador_4toAno,
  saveOrUpdateCentralizador_4toAno,
  deleteCentralizador_4toAno
} from "../../../controllers/fichas/4año/centralizador4toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/4to-ano/centralizador/:estudiante_id", verifyToken, getCentralizador_4toAno);
router.post("/4to-ano/centralizador/guardar", verifyToken, saveOrUpdateCentralizador_4toAno);
router.delete("/4to-ano/centralizador/:estudiante_id", verifyToken, deleteCentralizador_4toAno);

export default router;