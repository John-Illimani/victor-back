import { Router } from "express";
import {
  getActaInicio_3erAno,
  saveOrUpdateActaInicio_3erAno,
  deleteActaInicio_3erAno
} from "../../../controllers/fichas/3año/actaInicio3erAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/3er-ano/acta-inicio/:estudiante_id", verifyToken, getActaInicio_3erAno);
router.post("/3er-ano/acta-inicio/guardar", verifyToken, saveOrUpdateActaInicio_3erAno);
router.delete("/3er-ano/acta-inicio/:estudiante_id", verifyToken, deleteActaInicio_3erAno);

export default router;