import { Router } from "express";
import {
  getFichaF1_2doAno,
  saveOrUpdateFichaF1_2doAno,
  deleteFichaF1_2doAno
} from "../../../controllers/fichas/2año/fichaF1_2doAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/2do-ano/ficha-f1/:estudiante_id", verifyToken, getFichaF1_2doAno);
router.post("/2do-ano/ficha-f1/guardar", verifyToken, saveOrUpdateFichaF1_2doAno);
router.delete("/2do-ano/ficha-f1/:estudiante_id", verifyToken, deleteFichaF1_2doAno);

export default router;