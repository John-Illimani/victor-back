import { Router } from "express";
import {
  getFichaF5_1erAno,
  saveOrUpdateFichaF5_1erAno,
  deleteFichaF5_1erAno
} from "../../../controllers/fichas/1año/fichaF5_1erAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/1er-ano/ficha-f5/:estudiante_id", verifyToken, getFichaF5_1erAno);
router.post("/1er-ano/ficha-f5/guardar", verifyToken, saveOrUpdateFichaF5_1erAno);
router.delete("/1er-ano/ficha-f5/:estudiante_id", verifyToken, deleteFichaF5_1erAno);

export default router;