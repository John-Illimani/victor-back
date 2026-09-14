import { Router } from "express";
import { 
  getUsers, 
  createUser, 
  updateUser, 
  toggleUserStatus,
  deleteUser, 
  deleteMultipleUsers,
  importBatchUsers 
} from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/usuarios", verifyToken, getUsers);
router.post("/usuarios", verifyToken, createUser);
router.put("/usuarios/:id", verifyToken, updateUser);
router.patch("/usuarios/:id/status", verifyToken, toggleUserStatus);
router.delete("/usuarios/:id", verifyToken, deleteUser);
router.post("/usuarios/delete-batch", verifyToken, deleteMultipleUsers);
router.post("/usuarios/import-batch", verifyToken, importBatchUsers);

export default router;