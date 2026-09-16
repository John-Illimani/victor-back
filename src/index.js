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
import especialidadRoutes from "./routes/especialidad.routes.js";


import actaConformacion1erAnoRoutes from "./routes/routeFichas/1año/actaConformacion1erAno.routes.js";
import fichaF1Routes from "./routes/routeFichas/1año/fichaF1_1erAno.routes.js";
import fichaF2Routes from "./routes/routeFichas/1año/fichaF2_1erAno.routes.js";
import fichaF3Routes from "./routes/routeFichas/1año/fichaF3_1erAno.routes.js";
import fichaF4Routes from "./routes/routeFichas/1año/fichaF4_1erAno.routes.js";
import fichaF5Routes from "./routes/routeFichas/1año/fichaF5_1erAno.routes.js";
import CentralizadorAnio1Routes from "./routes/routeFichas/1año/centralizador_1erAno.routes.js";
import actaInicioAnio2Routes from "./routes/routeFichas/2año/actaInicio_2doAno.routes.js";
import actaConformacionRoutes from "./routes/routeFichas/2año/actaConformacion_2doAno.routes.js";
import fichaF12anioRoutes from "./routes/routeFichas/2año/fichaF1_2doAno.routes.js";
import fichaF22anioRoutes from "./routes/routeFichas/2año/fichaF2_2doAno.routes.js";
import fichaF32anioRoutes from "./routes/routeFichas/2año/fichaF3_2doAno.routes.js";
import fichaF42anioRoutes from "./routes/routeFichas/2año/fichaF4_2doAno.routes.js";
import fichaF52anioRoutes from "./routes/routeFichas/2año/fichaF5_2doAno.routes.js";
import fichaF62anioRoutes from "./routes/routeFichas/2año/fichaF6_2doAno.routes.js";
import centralizador2anioRoutes from "./routes/routeFichas/2año/centralizador2doAno.routes.js";
import actaConformacion3amioRoutes from "./routes/routeFichas/3año/actaConformacion3erAno.routes.js";
import actaInicio3anioRoutes from "./routes/routeFichas/3año/actaInicio3erAno.routes.js";
import actaSocializacion3anioRoutes from "./routes/routeFichas/3año/actaSocializacion3erAno.routes.js";
import fichaA13anioRoutes from "./routes/routeFichas/3año/fichaA13erAno.routes.js";
import fichaB13anioRoutes from "./routes/routeFichas/3año/fichaB13erAno.routes.js";
import fichaB23anioRoutes from "./routes/routeFichas/3año/fichaB23erAno.routes.js";
import fichaB33anioRoutes from "./routes/routeFichas/3año/fichaB33erAno.routes.js";
import fichaB43anioRoutes from "./routes/routeFichas/3año/fichaB43erAno.routes.js";
import fichaB53anioRoutes from "./routes/routeFichas/3año/fichaB53erAno.routes.js";
import centralizador3anioRoutes from "./routes/routeFichas/3año/centralizador3erAno.routes.js";
import fichaA14anioRoutes from "./routes/routeFichas/4año/fichaA14toAno.routes.js";
import fichaA24anioRoutes from "./routes/routeFichas/4año/fichaA24toAno.routes.js";
import fichaB14anioRoutes from "./routes/routeFichas/4año/fichaB14toAno.routes.js";
import fichaB24anioRoutes from "./routes/routeFichas/4año/fichaB24toAno.routes.js";
import fichaB34anioRoutes from "./routes/routeFichas/4año/fichaB34toAno.routes.js";
import fichaB44anioRoutes from "./routes/routeFichas/4año/fichaB44toAno.routes.js";
import fichaB54anioRoutes from "./routes/routeFichas/4año/fichaB54toAno.routes.js";
import fichaB64anioRoutes from "./routes/routeFichas/4año/fichaB64toAno.routes.js";
import fichaB74anioRoutes from "./routes/routeFichas/4año/fichaB74toAno.routes.js";
import fichaC14anioRoutes from "./routes/routeFichas/4año/fichaC14toAno.routes.js";
import fichaC24anioRoutes from "./routes/routeFichas/4año/fichaC24toAno.routes.js";
import actaFinal4anioRoutes from "./routes/routeFichas/4año/actaFinalEvaluacion4toAno.routes.js";
import actaPostergacion4anioRoutes from "./routes/routeFichas/4año/actaPostergacion4toAno.routes.js";
import centralizador4anioRoutes from "./routes/routeFichas/4año/centralizador4toAno.routes.js";
import fichaA15anioRoutes from "./routes/routeFichas/5año/fichaA15toAno.routes.js";
import fichaB15anioRoutes from "./routes/routeFichas/5año/fichaB15toAno.routes.js";
import fichaB25anioRoutes from "./routes/routeFichas/5año/fichaB25toAno.routes.js";
import fichaB35anioRoutes from "./routes/routeFichas/5año/fichaB35toAno.routes.js";
import fichaB45anioRoutes from "./routes/routeFichas/5año/fichaB45toAno.routes.js";
import fichaB55anioRoutes from "./routes/routeFichas/5año/fichaB55toAno.routes.js";
import fichaB65anioRoutes from "./routes/routeFichas/5año/fichaB65toAno.routes.js";
import fichaC15anioRoutes from "./routes/routeFichas/5año/fichaC15toAno.routes.js";
import fichaC25anioRoutes from "./routes/routeFichas/5año/fichaC25toAno.routes.js";
import centralizador5anioRoutes from "./routes/routeFichas/5año/centralizador5toAno.routes.js";
import actaPostergacion5anioRoutes from "./routes/routeFichas/5año/actaPostergacion5toAno.routes.js";


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
app.use("/api", especialidadRoutes);

app.use("/api", fichaRoutes);

// fichas primer año
app.use("/api", actaConformacion1erAnoRoutes);
app.use("/api", fichaF1Routes);
app.use("/api", fichaF2Routes);
app.use("/api", fichaF3Routes);
app.use("/api", fichaF4Routes);
app.use("/api", fichaF5Routes);
app.use("/api", CentralizadorAnio1Routes);

// fichas segundo año 
app.use("/api", actaInicioAnio2Routes);
app.use("/api", actaConformacionRoutes);
app.use("/api", fichaF12anioRoutes);
app.use("/api", fichaF22anioRoutes);
app.use("/api", fichaF32anioRoutes);
app.use("/api", fichaF42anioRoutes);
app.use("/api", fichaF52anioRoutes);
app.use("/api", fichaF62anioRoutes);
app.use("/api", centralizador2anioRoutes);

// fichas tercer año 
app.use("/api", actaConformacion3amioRoutes);
app.use("/api", actaInicio3anioRoutes);
app.use("/api", actaSocializacion3anioRoutes);
app.use("/api", fichaA13anioRoutes);
app.use("/api", fichaB13anioRoutes);
app.use("/api", fichaB23anioRoutes);
app.use("/api", fichaB33anioRoutes);
app.use("/api", fichaB43anioRoutes);
app.use("/api", fichaB53anioRoutes);
app.use("/api", centralizador3anioRoutes);

// fichas cuarto año 
app.use("/api", fichaA14anioRoutes);
app.use("/api", fichaA24anioRoutes);
app.use("/api", fichaB14anioRoutes);
app.use("/api", fichaB24anioRoutes);
app.use("/api", fichaB34anioRoutes);
app.use("/api", fichaB44anioRoutes);
app.use("/api", fichaB54anioRoutes);
app.use("/api", fichaB64anioRoutes);
app.use("/api", fichaB74anioRoutes);
app.use("/api", fichaC14anioRoutes);
app.use("/api", fichaC24anioRoutes);
app.use("/api", actaFinal4anioRoutes);
app.use("/api", actaPostergacion4anioRoutes);
app.use("/api", centralizador4anioRoutes);


// fichas 5to año 
app.use("/api", fichaA15anioRoutes);
app.use("/api", fichaB15anioRoutes);
app.use("/api", fichaB25anioRoutes);
app.use("/api", fichaB35anioRoutes);
app.use("/api", fichaB45anioRoutes);
app.use("/api", fichaB55anioRoutes);
app.use("/api", fichaB65anioRoutes);
app.use("/api", fichaC15anioRoutes);
app.use("/api", fichaC25anioRoutes);
app.use("/api", centralizador5anioRoutes);
app.use("/api", actaPostergacion5anioRoutes);




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