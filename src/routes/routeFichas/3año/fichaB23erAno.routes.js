import { Router } from "express";
import {
  getFichaB2_3erAno,
  saveOrUpdateFichaB2_3erAno,
  deleteFichaB2_3erAno
} from "../../../controllers/fichas/3año/fichaB23erAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/3er-ano/ficha-b2/:estudiante_id", verifyToken, getFichaB2_3erAno);
router.post("/3er-ano/ficha-b2/guardar", verifyToken, saveOrUpdateFichaB2_3erAno);
router.delete("/3er-ano/ficha-b2/:estudiante_id", verifyToken, deleteFichaB2_3erAno);

export default router;