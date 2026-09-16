import { Router } from "express";
import {
  getFichaF1_1erAno,
  saveOrUpdateFichaF1_1erAno,
  deleteFichaF1_1erAno
} from "../../../controllers/fichas/1año/fichaF1_1erAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/1er-ano/ficha-f1/:estudiante_id", verifyToken, getFichaF1_1erAno);
router.post("/1er-ano/ficha-f1/guardar", verifyToken, saveOrUpdateFichaF1_1erAno);
router.delete("/1er-ano/ficha-f1/:estudiante_id", verifyToken, deleteFichaF1_1erAno);

export default router;