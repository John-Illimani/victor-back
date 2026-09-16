import { Router } from "express";
import {
  getActaSocializacion_3erAno,
  saveOrUpdateActaSocializacion_3erAno,
  deleteActaSocializacion_3erAno
} from "../../../controllers/fichas/3año/actaSocializacion3erAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/3er-ano/acta-socializacion/:estudiante_id", verifyToken, getActaSocializacion_3erAno);
router.post("/3er-ano/acta-socializacion/guardar", verifyToken, saveOrUpdateActaSocializacion_3erAno);
router.delete("/3er-ano/acta-socializacion/:estudiante_id", verifyToken, deleteActaSocializacion_3erAno);

export default router;