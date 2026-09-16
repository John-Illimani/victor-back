import { Router } from "express";
import {
  getFichaB7_4toAno,
  saveOrUpdateFichaB7_4toAno,
  deleteFichaB7_4toAno
} from "../../../controllers/fichas/4año/fichaB74toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/4to-ano/ficha-b7/:estudiante_id", verifyToken, getFichaB7_4toAno);
router.post("/4to-ano/ficha-b7/guardar", verifyToken, saveOrUpdateFichaB7_4toAno);
router.delete("/4to-ano/ficha-b7/:estudiante_id", verifyToken, deleteFichaB7_4toAno);

export default router;