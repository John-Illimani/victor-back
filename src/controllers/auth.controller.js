import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../database/database.js";

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Por favor, ingresa usuario y contraseña." });
  }

  try {
    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.correo, 
        u.password_hash, 
        u.nombre, 
        u.apellido, 
        u.rol, 
        u.ci,
        u.esfm_ua,
        u.especialidad,
        u.item_docente,
        u.unidad_educativa_id,
        ue.nombre AS unidad_educativa_nombre
      FROM usuarios u
      LEFT JOIN unidades_educativas ue ON u.unidad_educativa_id = ue.id
      WHERE u.username = $1 OR u.correo = $1
    `;
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Credenciales incorrectas." });
    }

    const user = result.rows[0];

    // Verificar hash de contraseña con BCrypt
    let isPasswordValid = false;
    if (user.password_hash.startsWith("$2a$") || user.password_hash.startsWith("$2b$")) {
      isPasswordValid = await bcrypt.compare(password, user.password_hash);
    } else {
      isPasswordValid = password === user.password_hash;

      // Migración automática de contraseña en texto plano a Hash de seguridad
      if (isPasswordValid) {
        try {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          await pool.query("UPDATE usuarios SET password_hash = $1 WHERE id = $2", [hashedPassword, user.id]);
        } catch (hashError) {
          console.error("⚠️ No se pudo migrar la contraseña a hash automáticamente:", hashError);
        }
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciales incorrectas." });
    }

    // Payload para JWT
    const payload = {
      id: user.id,
      username: user.username,
      correo: user.correo,
      rol: user.rol,
    };

    const secretKey = process.env.JWT_SECRET || "secreto_super_seguro_123";
    const token = jwt.sign(payload, secretKey, { expiresIn: "8h" });

    return res.json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user.id,
        username: user.username,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        rol: user.rol,
        ci: user.ci,
        esfm_ua: user.esfm_ua,
        especialidad: user.especialidad,
        item_docente: user.item_docente,
        unidad_educativa_id: user.unidad_educativa_id,
        unidad_educativa_nombre: user.unidad_educativa_nombre
      },
    });

  } catch (error) {
    console.error("❌ ERROR EN EL LOGIN:", error);
    return res.status(500).json({ 
      message: "Error interno del servidor.",
      error: error.message 
    });
  }
};


export const logout = async (req, res) => {
  try {
    // Si manejas listas negras de tokens o auditorías de sesión en PostgreSQL, la lógica se ejecuta aquí.
    return res.json({ message: "Sesión cerrada correctamente." });
  } catch (error) {
    return res.status(500).json({ message: "Error al cerrar sesión.", error: error.message });
  }
};