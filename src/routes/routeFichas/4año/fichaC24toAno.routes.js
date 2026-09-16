import { Router } from "express";
import {
  getFichaC2_4toAno,
  saveOrUpdateFichaC2_4toAno,
  deleteFichaC2_4toAno
} from "../../../controllers/fichas/4año/fichaC24toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/4to-ano/ficha-c2/:estudiante_id", verifyToken, getFichaC2_4toAno);
router.post("/4to-ano/ficha-c2/guardar", verifyToken, saveOrUpdateFichaC2_4toAno);
router.delete("/4to-ano/ficha-c2/:estudiante_id", verifyToken, deleteFichaC2_4toAno);

export default router;