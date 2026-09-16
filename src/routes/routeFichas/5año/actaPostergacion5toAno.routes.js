import { Router } from "express";
import {
  getActaPostergacion_5toAno,
  saveOrUpdateActaPostergacion_5toAno,
  deleteActaPostergacion_5toAno
} from "../../../controllers/fichas/5año/actaPostergacion5toAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/5to-ano/acta-postergacion/:estudiante_id", verifyToken, getActaPostergacion_5toAno);
router.post("/5to-ano/acta-postergacion/guardar", verifyToken, saveOrUpdateActaPostergacion_5toAno);
router.delete("/5to-ano/acta-postergacion/:estudiante_id", verifyToken, deleteActaPostergacion_5toAno);

export default router;