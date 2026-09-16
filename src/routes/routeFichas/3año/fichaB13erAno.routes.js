import { Router } from "express";
import {
  getFichaB1_3erAno,
  saveOrUpdateFichaB1_3erAno,
  deleteFichaB1_3erAno
} from "../../../controllers/fichas/3año/fichaB13erAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/3er-ano/ficha-b1/:estudiante_id", verifyToken, getFichaB1_3erAno);
router.post("/3er-ano/ficha-b1/guardar", verifyToken, saveOrUpdateFichaB1_3erAno);
router.delete("/3er-ano/ficha-b1/:estudiante_id", verifyToken, deleteFichaB1_3erAno);

export default router;