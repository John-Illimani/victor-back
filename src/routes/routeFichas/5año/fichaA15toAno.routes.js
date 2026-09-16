import { Router } from "express";
import {
  getFichaA1_5toAno,
  saveOrUpdateFichaA1_5toAno,
  deleteFichaA1_5toAno
} from "../../../controllers/fichas/5año/fichaA15toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/5to-ano/ficha-a1/:estudiante_id", verifyToken, getFichaA1_5toAno);
router.post("/5to-ano/ficha-a1/guardar", verifyToken, saveOrUpdateFichaA1_5toAno);
router.delete("/5to-ano/ficha-a1/:estudiante_id", verifyToken, deleteFichaA1_5toAno);

export default router;