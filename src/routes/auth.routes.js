import { Router } from "express";
import { login, logout } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Endpoint de Login
router.post("/login", login);

// Ruta de Logout (Protegida)
router.post("/logout", verifyToken, logout);

// Endpoint de verificación de sesión activa
router.get("/verify-token", verifyToken, (req, res) => {
  return res.json({ valid: true, user: req.user });
});

export default router;