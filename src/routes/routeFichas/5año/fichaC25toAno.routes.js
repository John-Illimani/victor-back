import { Router } from "express";
import {
  getFichaC2_5toAno,
  saveOrUpdateFichaC2_5toAno,
  deleteFichaC2_5toAno
} from "../../../controllers/fichas/5año/fichaC25toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/5to-ano/ficha-c2/:estudiante_id", verifyToken, getFichaC2_5toAno);
router.post("/5to-ano/ficha-c2/guardar", verifyToken, saveOrUpdateFichaC2_5toAno);
router.delete("/5to-ano/ficha-c2/:estudiante_id", verifyToken, deleteFichaC2_5toAno);

export default router;