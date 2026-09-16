import { Router } from "express";
import {
  getFichaF2_1erAno,
  saveOrUpdateFichaF2_1erAno,
  deleteFichaF2_1erAno
} from "../../../controllers/fichas/1año/fichaF2_1erAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/1er-ano/ficha-f2/:estudiante_id", verifyToken, getFichaF2_1erAno);
router.post("/1er-ano/ficha-f2/guardar", verifyToken, saveOrUpdateFichaF2_1erAno);
router.delete("/1er-ano/ficha-f2/:estudiante_id", verifyToken, deleteFichaF2_1erAno);

export default router;