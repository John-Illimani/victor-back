import { Router } from "express";
import {
  getFichaC1_4toAno,
  saveOrUpdateFichaC1_4toAno,
  deleteFichaC1_4toAno
} from "../../../controllers/fichas/4año/fichaC14toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/4to-ano/ficha-c1/:estudiante_id", verifyToken, getFichaC1_4toAno);
router.post("/4to-ano/ficha-c1/guardar", verifyToken, saveOrUpdateFichaC1_4toAno);
router.delete("/4to-ano/ficha-c1/:estudiante_id", verifyToken, deleteFichaC1_4toAno);

export default router;