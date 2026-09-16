import { Router } from "express";
import {
  getFichaA1_3erAno,
  saveOrUpdateFichaA1_3erAno,
  deleteFichaA1_3erAno
} from "../../../controllers/fichas/3año/fichaA13erAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/3er-ano/ficha-a1/:estudiante_id", verifyToken, getFichaA1_3erAno);
router.post("/3er-ano/ficha-a1/guardar", verifyToken, saveOrUpdateFichaA1_3erAno);
router.delete("/3er-ano/ficha-a1/:estudiante_id", verifyToken, deleteFichaA1_3erAno);

export default router;