import { Router } from "express";
import {
  getCentralizador5toAno,
  saveOrUpdateCentralizador5toAno,
  deleteCentralizador5toAno
} from "../../../controllers/fichas/5año/centralizador5toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/5to-ano/centralizador/:estudiante_id", verifyToken, getCentralizador5toAno);
router.post("/5to-ano/centralizador/guardar", verifyToken, saveOrUpdateCentralizador5toAno);
router.delete("/5to-ano/centralizador/:estudiante_id", verifyToken, deleteCentralizador5toAno);

export default router;