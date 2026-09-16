import { Router } from "express";
import {
  getActaConformacion_2doAno,
  saveOrUpdateActaConformacion_2doAno,
  deleteActaConformacion_2doAno
} from "../../../controllers/fichas/2año/actaConformacion_2doAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/2do-ano/acta-conformacion/:estudiante_id", verifyToken, getActaConformacion_2doAno);
router.post("/2do-ano/acta-conformacion/guardar", verifyToken, saveOrUpdateActaConformacion_2doAno);
router.delete("/2do-ano/acta-conformacion/:estudiante_id", verifyToken, deleteActaConformacion_2doAno);

export default router;