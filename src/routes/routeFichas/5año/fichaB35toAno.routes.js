import { Router } from "express";
import {
  getFichaB3_5toAno,
  saveOrUpdateFichaB3_5toAno,
  deleteFichaB3_5toAno
} from "../../../controllers/fichas/5año/fichaB35toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/5to-ano/ficha-b3/:estudiante_id", verifyToken, getFichaB3_5toAno);
router.post("/5to-ano/ficha-b3/guardar", verifyToken, saveOrUpdateFichaB3_5toAno);
router.delete("/5to-ano/ficha-b3/:estudiante_id", verifyToken, deleteFichaB3_5toAno);

export default router;