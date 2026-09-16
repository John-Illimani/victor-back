import { Router } from "express";
import {
  getFichaB5_4toAno,
  saveOrUpdateFichaB5_4toAno,
  deleteFichaB5_4toAno
} from "../../../controllers/fichas/4año/fichaB54toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/4to-ano/ficha-b5/:estudiante_id", verifyToken, getFichaB5_4toAno);
router.post("/4to-ano/ficha-b5/guardar", verifyToken, saveOrUpdateFichaB5_4toAno);
router.delete("/4to-ano/ficha-b5/:estudiante_id", verifyToken, deleteFichaB5_4toAno);

export default router;