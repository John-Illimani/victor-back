import { Router } from "express";
import { 
  getActasByGestionAno, 
  getHistorialActa, 
  registrarHistorialActa 
} from "../controllers/acta.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/actas/:gestion/:ano", verifyToken, getActasByGestionAno);
router.get("/actas/historial/:estudianteId", verifyToken, getHistorialActa);
router.post("/actas/historial", verifyToken, registrarHistorialActa);

export default router;