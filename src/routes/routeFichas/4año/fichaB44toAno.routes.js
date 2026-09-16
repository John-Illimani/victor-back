import { Router } from "express";
import {
  getFichaB4_4toAno,
  saveOrUpdateFichaB4_4toAno,
  deleteFichaB4_4toAno
} from "../../../controllers/fichas/4año/fichaB44toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/4to-ano/ficha-b4/:estudiante_id", verifyToken, getFichaB4_4toAno);
router.post("/4to-ano/ficha-b4/guardar", verifyToken, saveOrUpdateFichaB4_4toAno);
router.delete("/4to-ano/ficha-b4/:estudiante_id", verifyToken, deleteFichaB4_4toAno);

export default router;