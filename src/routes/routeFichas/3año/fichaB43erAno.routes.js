import { Router } from "express";
import {
  getFichaB4_3erAno,
  saveOrUpdateFichaB4_3erAno,
  deleteFichaB4_3erAno
} from "../../../controllers/fichas/3año/fichaB43erAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/3er-ano/ficha-b4/:estudiante_id", verifyToken, getFichaB4_3erAno);
router.post("/3er-ano/ficha-b4/guardar", verifyToken, saveOrUpdateFichaB4_3erAno);
router.delete("/3er-ano/ficha-b4/:estudiante_id", verifyToken, deleteFichaB4_3erAno);

export default router;