import { Router } from "express";
import {
  getFichaB6_4toAno,
  saveOrUpdateFichaB6_4toAno,
  deleteFichaB6_4toAno
} from "../../../controllers/fichas/4año/fichaB64toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/4to-ano/ficha-b6/:estudiante_id", verifyToken, getFichaB6_4toAno);
router.post("/4to-ano/ficha-b6/guardar", verifyToken, saveOrUpdateFichaB6_4toAno);
router.delete("/4to-ano/ficha-b6/:estudiante_id", verifyToken, deleteFichaB6_4toAno);

export default router;