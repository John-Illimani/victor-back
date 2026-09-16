import { Router } from "express";
import {
  getFichaF3_1erAno,
  saveOrUpdateFichaF3_1erAno,
  deleteFichaF3_1erAno
} from "../../../controllers/fichas/1año/fichaF3_1erAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/1er-ano/ficha-f3/:estudiante_id", verifyToken, getFichaF3_1erAno);
router.post("/1er-ano/ficha-f3/guardar", verifyToken, saveOrUpdateFichaF3_1erAno);
router.delete("/1er-ano/ficha-f3/:estudiante_id", verifyToken, deleteFichaF3_1erAno);

export default router;