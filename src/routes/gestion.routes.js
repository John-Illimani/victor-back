import { Router } from "express";
import { 
  getGestiones, 
  createGestion, 
  updateGestion, 
  toggleEstadoGestion 
} from "../controllers/gestion.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/gestiones", verifyToken, getGestiones);
router.post("/gestiones", verifyToken, createGestion);
router.put("/gestiones/:id", verifyToken, updateGestion);
router.patch("/gestiones/:id/toggle", verifyToken, toggleEstadoGestion);

export default router;