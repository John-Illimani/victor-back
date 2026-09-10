import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; 

  if (!token) {
    return res.status(403).json({ message: "Acceso denegado. No se proporcionó un token." });
  }

  try {
    const secretKey = process.env.JWT_SECRET || "mi_secreto_super_seguro";
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Asigna los datos del usuario a la request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado." });
  }
};