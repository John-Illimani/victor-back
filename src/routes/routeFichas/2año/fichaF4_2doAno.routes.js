import { Router } from "express";
import {
  getFichaF4_2doAno,
  saveOrUpdateFichaF4_2doAno,
  deleteFichaF4_2doAno
} from "../../../controllers/fichas/2año/fichaF4_2doAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/2do-ano/ficha-f4/:estudiante_id", verifyToken, getFichaF4_2doAno);
router.post("/2do-ano/ficha-f4/guardar", verifyToken, saveOrUpdateFichaF4_2doAno);
router.delete("/2do-ano/ficha-f4/:estudiante_id", verifyToken, deleteFichaF4_2doAno);

export default router;