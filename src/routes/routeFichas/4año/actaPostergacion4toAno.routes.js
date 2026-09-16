import { Router } from "express";
import {
  getActaPostergacion_4toAno,
  saveOrUpdateActaPostergacion_4toAno,
  deleteActaPostergacion_4toAno
} from "../../../controllers/fichas/4año/actaPostergacion4toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/4to-ano/acta-postergacion/:estudiante_id", verifyToken, getActaPostergacion_4toAno);
router.post("/4to-ano/acta-postergacion/guardar", verifyToken, saveOrUpdateActaPostergacion_4toAno);
router.delete("/4to-ano/acta-postergacion/:estudiante_id", verifyToken, deleteActaPostergacion_4toAno);

export default router;