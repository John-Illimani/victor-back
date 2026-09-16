import { Router } from "express";
import {
  getFichaB5_5toAno,
  saveOrUpdateFichaB5_5toAno,
  deleteFichaB5_5toAno
} from "../../../controllers/fichas/5año/fichaB55toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/5to-ano/ficha-b5/:estudiante_id", verifyToken, getFichaB5_5toAno);
router.post("/5to-ano/ficha-b5/guardar", verifyToken, saveOrUpdateFichaB5_5toAno);
router.delete("/5to-ano/ficha-b5/:estudiante_id", verifyToken, deleteFichaB5_5toAno);

export default router;