import { Router } from "express";
import {
  getActaInicio_2doAno,
  saveOrUpdateActaInicio_2doAno,
  deleteActaInicio_2doAno
} from "../../../controllers/fichas/2año/actaInicio_2doAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/2do-ano/acta-inicio/:estudiante_id", verifyToken, getActaInicio_2doAno);
router.post("/2do-ano/acta-inicio/guardar", verifyToken, saveOrUpdateActaInicio_2doAno);
router.delete("/2do-ano/acta-inicio/:estudiante_id", verifyToken, deleteActaInicio_2doAno);

export default router;