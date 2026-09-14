import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { PORT } from "./config.js";

// Importación de rutas oficiales del sistema IEPC-PEC (ESFM/UA)
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import estudiantesRoutes from "./routes/student.routes.js";
import docenteAcompañanteRoutes from "./routes/teacher.routes.js";
import docenteGuiaRoutes from "./routes/guide.routes.js";
import fichaRoutes from "./routes/ficha.routes.js";



dotenv.config();

const app = express();

// 1. Logger de solicitudes HTTP
app.use(morgan("dev"));

// 2. Configuración de CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// 3. Límite de carga para evidencias y PDFs en Base64 (Evita Error 413)
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true, parameterLimit: 100000 }));

// 4. Registro de Rutas API (Prefijo /api)
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", estudiantesRoutes);
app.use("/api", docenteAcompañanteRoutes);
app.use("/api", docenteGuiaRoutes);
app.use("/api", fichaRoutes);



// 5. Manejo global de errores (Payloads pesados y servidor)
app.use((err, req, res, next) => {
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      error: "Carga demasiado pesada",
      detalle: "El tamaño total del documento o imagen adjunta supera el límite permitido.",
    });
  }
  return res.status(500).json({ 
    error: "Error interno del servidor", 
    detalle: err.message 
  });
});

app.listen(PORT, () => {
  console.log(` SERVIDOR IEPC-PEC CORRIENDO EN EL PUERTO ${PORT}`);
});