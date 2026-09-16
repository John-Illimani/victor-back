import { Router } from "express";
import {
  getFichaF4_1erAno,
  saveOrUpdateFichaF4_1erAno,
  deleteFichaF4_1erAno
} from "../../../controllers/fichas/1año/fichaF4_1erAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/1er-ano/ficha-f4/:estudiante_id", verifyToken, getFichaF4_1erAno);
router.post("/1er-ano/ficha-f4/guardar", verifyToken, saveOrUpdateFichaF4_1erAno);
router.delete("/1er-ano/ficha-f4/:estudiante_id", verifyToken, deleteFichaF4_1erAno);

export default router;