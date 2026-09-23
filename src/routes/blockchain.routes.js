import { Router } from "express";
import {
  certificarCentralizador5toAno,
  verificarCertificacionPublica
} from "../controllers/blockchain.controller.js";

const router = Router();

// POST: Certificar el centralizador de 5to Año
router.post("/certificar-5to-ano", certificarCentralizador5toAno);

// GET: Verificación pública por QR o código Hash
router.get("/verificar", verificarCertificacionPublica);

export default router;