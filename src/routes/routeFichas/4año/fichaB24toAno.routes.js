import { Router } from "express";
import {
  getFichaB2_4toAno,
  saveOrUpdateFichaB2_4toAno,
  deleteFichaB2_4toAno
} from "../../../controllers/fichas/4año/fichaB24toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/4to-ano/ficha-b2/:estudiante_id", verifyToken, getFichaB2_4toAno);
router.post("/4to-ano/ficha-b2/guardar", verifyToken, saveOrUpdateFichaB2_4toAno);
router.delete("/4to-ano/ficha-b2/:estudiante_id", verifyToken, deleteFichaB2_4toAno);

export default router;