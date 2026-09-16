import { Router } from "express";
import {
  getActaFinal_4toAno,
  saveOrUpdateActaFinal_4toAno,
  deleteActaFinal_4toAno
} from "../../../controllers/fichas/4año/actaFinalEvaluacion4toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/4to-ano/acta-final/:estudiante_id", verifyToken, getActaFinal_4toAno);
router.post("/4to-ano/acta-final/guardar", verifyToken, saveOrUpdateActaFinal_4toAno);
router.delete("/4to-ano/acta-final/:estudiante_id", verifyToken, deleteActaFinal_4toAno);

export default router;