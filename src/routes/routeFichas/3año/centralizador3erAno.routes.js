import { Router } from "express";
import {
  getCentralizador_3erAno,
  saveOrUpdateCentralizador_3erAno,
  deleteCentralizador_3erAno
} from "../../../controllers/fichas/3año/centralizador3erAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/3er-ano/centralizador/:estudiante_id", verifyToken, getCentralizador_3erAno);
router.post("/3er-ano/centralizador/guardar", verifyToken, saveOrUpdateCentralizador_3erAno);
router.delete("/3er-ano/centralizador/:estudiante_id", verifyToken, deleteCentralizador_3erAno);

export default router;