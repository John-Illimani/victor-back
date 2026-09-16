import { Router } from "express";
import {
  getFichaB6_5toAno,
  saveOrUpdateFichaB6_5toAno,
  deleteFichaB6_5toAno
} from "../../../controllers/fichas/5año/fichaB65toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/5to-ano/ficha-b6/:estudiante_id", verifyToken, getFichaB6_5toAno);
router.post("/5to-ano/ficha-b6/guardar", verifyToken, saveOrUpdateFichaB6_5toAno);
router.delete("/5to-ano/ficha-b6/:estudiante_id", verifyToken, deleteFichaB6_5toAno);

export default router;