import { Router } from "express";
import {
  getFichaB1_5toAno,
  saveOrUpdateFichaB1_5toAno,
  deleteFichaB1_5toAno
} from "../../../controllers/fichas/5año/fichaB15toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/5to-ano/ficha-b1/:estudiante_id", verifyToken, getFichaB1_5toAno);
router.post("/5to-ano/ficha-b1/guardar", verifyToken, saveOrUpdateFichaB1_5toAno);
router.delete("/5to-ano/ficha-b1/:estudiante_id", verifyToken, deleteFichaB1_5toAno);

export default router;