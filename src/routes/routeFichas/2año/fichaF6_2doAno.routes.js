import { Router } from "express";
import {
  getFichaF6_2doAno,
  saveOrUpdateFichaF6_2doAno,
  deleteFichaF6_2doAno
} from "../../../controllers/fichas/2año/fichaF6_2doAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/2do-ano/ficha-f6/:estudiante_id", verifyToken, getFichaF6_2doAno);
router.post("/2do-ano/ficha-f6/guardar", verifyToken, saveOrUpdateFichaF6_2doAno);
router.delete("/2do-ano/ficha-f6/:estudiante_id", verifyToken, deleteFichaF6_2doAno);

export default router;