import { Router } from "express";
import { 
  getGuides, 
  createGuide, 
  updateGuide, 
  deleteGuide, 
  deleteMultipleGuides, 
  importBatchGuides 
} from "../controllers/guide.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/docentes-guia", verifyToken, getGuides);
router.post("/docentes-guia", verifyToken, createGuide);
router.put("/docentes-guia/:id", verifyToken, updateGuide);
router.delete("/docentes-guia/:id", verifyToken, deleteGuide);
router.post("/docentes-guia/delete-batch", verifyToken, deleteMultipleGuides);
router.post("/docentes-guia/import-batch", verifyToken, importBatchGuides);

export default router;