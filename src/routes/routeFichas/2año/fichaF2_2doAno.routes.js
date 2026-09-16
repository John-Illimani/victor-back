import { Router } from "express";
import {
  getFichaF2_2doAno,
  saveOrUpdateFichaF2_2doAno,
  deleteFichaF2_2doAno
} from "../../../controllers/fichas/2año/fichaF2_2doAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/2do-ano/ficha-f2/:estudiante_id", verifyToken, getFichaF2_2doAno);
router.post("/2do-ano/ficha-f2/guardar", verifyToken, saveOrUpdateFichaF2_2doAno);
router.delete("/2do-ano/ficha-f2/:estudiante_id", verifyToken, deleteFichaF2_2doAno);

export default router;