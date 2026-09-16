import { Router } from "express";
import {
  getFichaB4_5toAno,
  saveOrUpdateFichaB4_5toAno,
  deleteFichaB4_5toAno
} from "../../../controllers/fichas/5año/fichaB45toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/5to-ano/ficha-b4/:estudiante_id", verifyToken, getFichaB4_5toAno);
router.post("/5to-ano/ficha-b4/guardar", verifyToken, saveOrUpdateFichaB4_5toAno);
router.delete("/5to-ano/ficha-b4/:estudiante_id", verifyToken, deleteFichaB4_5toAno);

export default router;