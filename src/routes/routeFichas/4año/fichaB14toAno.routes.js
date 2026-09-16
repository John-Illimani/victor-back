import { Router } from "express";
import {
  getFichaB1_4toAno,
  saveOrUpdateFichaB1_4toAno,
  deleteFichaB1_4toAno
} from "../../../controllers/fichas/4año/fichaB14toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/4to-ano/ficha-b1/:estudiante_id", verifyToken, getFichaB1_4toAno);
router.post("/4to-ano/ficha-b1/guardar", verifyToken, saveOrUpdateFichaB1_4toAno);
router.delete("/4to-ano/ficha-b1/:estudiante_id", verifyToken, deleteFichaB1_4toAno);

export default router;