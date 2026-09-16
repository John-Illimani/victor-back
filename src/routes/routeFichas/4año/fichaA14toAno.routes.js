import { Router } from "express";
import {
  getFichaA1_4toAno,
  saveOrUpdateFichaA1_4toAno,
  deleteFichaA1_4toAno
} from "../../../controllers/fichas/4año/fichaA14toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/4to-ano/ficha-a1/:estudiante_id", verifyToken, getFichaA1_4toAno);
router.post("/4to-ano/ficha-a1/guardar", verifyToken, saveOrUpdateFichaA1_4toAno);
router.delete("/4to-ano/ficha-a1/:estudiante_id", verifyToken, deleteFichaA1_4toAno);

export default router;