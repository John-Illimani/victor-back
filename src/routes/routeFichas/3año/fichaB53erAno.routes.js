import { Router } from "express";
import {
  getFichaB5_3erAno,
  saveOrUpdateFichaB5_3erAno,
  deleteFichaB5_3erAno
} from "../../../controllers/fichas/3año/fichaB53erAno.controller.js";
import { verifyToken } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/3er-ano/ficha-b5/:estudiante_id", verifyToken, getFichaB5_3erAno);
router.post("/3er-ano/ficha-b5/guardar", verifyToken, saveOrUpdateFichaB5_3erAno);
router.delete("/3er-ano/ficha-b5/:estudiante_id", verifyToken, deleteFichaB5_3erAno);

export default router;