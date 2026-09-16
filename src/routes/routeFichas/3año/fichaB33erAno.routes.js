import { Router } from "express";
import {
  getFichaB3_3erAno,
  saveOrUpdateFichaB3_3erAno,
  deleteFichaB3_3erAno
} from "../../../controllers/fichas/3año/fichaB33erAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/3er-ano/ficha-b3/:estudiante_id", verifyToken, getFichaB3_3erAno);
router.post("/3er-ano/ficha-b3/guardar", verifyToken, saveOrUpdateFichaB3_3erAno);
router.delete("/3er-ano/ficha-b3/:estudiante_id", verifyToken, deleteFichaB3_3erAno);

export default router;