import { Router } from "express";
import {
  getFichaA2_4toAno,
  saveOrUpdateFichaA2_4toAno,
  deleteFichaA2_4toAno
} from "../../../controllers/fichas/4año/fichaA24toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/4to-ano/ficha-a2/:estudiante_id", verifyToken, getFichaA2_4toAno);
router.post("/4to-ano/ficha-a2/guardar", verifyToken, saveOrUpdateFichaA2_4toAno);
router.delete("/4to-ano/ficha-a2/:estudiante_id", verifyToken, deleteFichaA2_4toAno);

export default router;