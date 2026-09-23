import { Router } from "express";
import {
  getCentralizador_2doAno,
  saveCentralizadorDetalles_2doAno,
  deleteCentralizador_2doAno,
} from "../../../controllers/fichas/2año/centralizador2doAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/2do-ano/centralizador/:estudiante_id", verifyToken, getCentralizador_2doAno);
router.post("/2do-ano/centralizador/guardar-detalles", verifyToken, saveCentralizadorDetalles_2doAno);
router.delete("/2do-ano/centralizador/:estudiante_id", verifyToken, deleteCentralizador_2doAno);

export default router;