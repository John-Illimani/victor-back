import { Router } from "express";
import {
  getFichaF5_2doAno,
  saveOrUpdateFichaF5_2doAno,
  deleteFichaF5_2doAno
} from "../../../controllers/fichas/2año/fichaF5_2doAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/2do-ano/ficha-f5/:estudiante_id", verifyToken, getFichaF5_2doAno);
router.post("/2do-ano/ficha-f5/guardar", verifyToken, saveOrUpdateFichaF5_2doAno);
router.delete("/2do-ano/ficha-f5/:estudiante_id", verifyToken, deleteFichaF5_2doAno);

export default router;