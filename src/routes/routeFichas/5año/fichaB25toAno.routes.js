import { Router } from "express";
import {
  getFichaB2_5toAno,
  saveOrUpdateFichaB2_5toAno,
  deleteFichaB2_5toAno
} from "../../../controllers/fichas/5año/fichaB25toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/5to-ano/ficha-b2/:estudiante_id", verifyToken, getFichaB2_5toAno);
router.post("/5to-ano/ficha-b2/guardar", verifyToken, saveOrUpdateFichaB2_5toAno);
router.delete("/5to-ano/ficha-b2/:estudiante_id", verifyToken, deleteFichaB2_5toAno);

export default router;