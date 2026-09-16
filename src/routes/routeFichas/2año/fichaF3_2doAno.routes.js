import { Router } from "express";
import {
  getFichaF3_2doAno,
  saveOrUpdateFichaF3_2doAno,
  deleteFichaF3_2doAno
} from "../../../controllers/fichas/2año/fichaF3_2doAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/2do-ano/ficha-f3/:estudiante_id", verifyToken, getFichaF3_2doAno);
router.post("/2do-ano/ficha-f3/guardar", verifyToken, saveOrUpdateFichaF3_2doAno);
router.delete("/2do-ano/ficha-f3/:estudiante_id", verifyToken, deleteFichaF3_2doAno);

export default router;