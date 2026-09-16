import { Router } from "express";
import {
  getFichaC1_5toAno,
  saveOrUpdateFichaC1_5toAno,
  deleteFichaC1_5toAno
} from "../../../controllers/fichas/5año/fichaC15toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/5to-ano/ficha-c1/:estudiante_id", verifyToken, getFichaC1_5toAno);
router.post("/5to-ano/ficha-c1/guardar", verifyToken, saveOrUpdateFichaC1_5toAno);
router.delete("/5to-ano/ficha-c1/:estudiante_id", verifyToken, deleteFichaC1_5toAno);

export default router;