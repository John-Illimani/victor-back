import { Router } from "express";
import {
  getFichaB3_4toAno,
  saveOrUpdateFichaB3_4toAno,
  deleteFichaB3_4toAno
} from "../../../controllers/fichas/4año/fichaB34toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/4to-ano/ficha-b3/:estudiante_id", verifyToken, getFichaB3_4toAno);
router.post("/4to-ano/ficha-b3/guardar", verifyToken, saveOrUpdateFichaB3_4toAno);
router.delete("/4to-ano/ficha-b3/:estudiante_id", verifyToken, deleteFichaB3_4toAno);

export default router;