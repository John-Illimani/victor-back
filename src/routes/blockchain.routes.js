import { Router } from "express";
import {
  certificarCentralizador4toAno,
  certificarCentralizador5toAno,
  verificarCertificacionPublica,
  certificarCentralizador3erAno,
  certificarCentralizador2doAno,
  certificarCentralizador1erAno
} from "../controllers/blockchain.controller.js";

const router = Router();

router.post("/certificar-1er-ano", certificarCentralizador1erAno);

router.post("/certificar-2do-ano", certificarCentralizador2doAno);

router.post("/certificar-3er-ano", certificarCentralizador3erAno);

router.post("/certificar-4to-ano", certificarCentralizador4toAno);

router.post("/certificar-5to-ano", certificarCentralizador5toAno);

router.get("/verificar", verificarCertificacionPublica);

export default router;
