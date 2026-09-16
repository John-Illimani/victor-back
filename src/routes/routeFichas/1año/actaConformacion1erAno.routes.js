import { Router } from "express";
import {
  getActaConformacion1erAno,
  createActaConformacion1erAno,
  updateActaConformacion1erAno,
  deleteActaConformacion1erAno,
  saveOrUpdateActaConformacion1erAno
} from "../../../controllers/fichas/1año/actaConformacion1erAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/1er-ano/acta-conformacion/:estudiante_id", verifyToken, getActaConformacion1erAno);
router.post("/1er-ano/acta-conformacion", verifyToken, createActaConformacion1erAno);
router.put("/1er-ano/acta-conformacion/:estudiante_id", verifyToken, updateActaConformacion1erAno);
router.delete("/1er-ano/acta-conformacion/:estudiante_id", verifyToken, deleteActaConformacion1erAno);
router.post("/1er-ano/acta-conformacion/guardar", verifyToken, saveOrUpdateActaConformacion1erAno);

export default router;