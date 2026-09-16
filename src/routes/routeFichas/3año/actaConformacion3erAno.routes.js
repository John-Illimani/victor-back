import { Router } from "express";
import {
  getActaConformacion_3erAno,
  saveOrUpdateActaConformacion_3erAno,
  deleteActaConformacion_3erAno
} from "../../../controllers/fichas/3año/actaConformacion3erAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/3er-ano/acta-conformacion/:estudiante_id", verifyToken, getActaConformacion_3erAno);
router.post("/3er-ano/acta-conformacion/guardar", verifyToken, saveOrUpdateActaConformacion_3erAno);
router.delete("/3er-ano/acta-conformacion/:estudiante_id", verifyToken, deleteActaConformacion_3erAno);

export default router;