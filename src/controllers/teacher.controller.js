import bcrypt from "bcryptjs";
import { pool } from "../database/database.js";

// 1. OBTENER TODOS LOS DOCENTES ACOMPAÑANTES
export const getTeachers = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.correo, 
        u.nombre, 
        u.apellido, 
        u.ci, 
        u.telefono,
        u.rol, 
        u.esfm_ua,
        u.especialidad,
        u.item_docente,
        u.creado_en 
      FROM usuarios u
      WHERE u.rol = 'DOCENTE_ACOMPANANTE'
      ORDER BY u.creado_en DESC
    `;
    const result = await pool.query(query);
    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener docentes acompañantes:", error);
    return res.status(500).json({ 
      message: "Error al obtener la lista de docentes acompañantes.", 
      error: error.message 
    });
  }
};

// 2. CREAR UN DOCENTE ACOMPAÑANTE INDIVIDUAL
export const createTeacher = async (req, res) => {
  const { username, password, nombre, apellido, ci, telefono, esfm_ua, especialidad, item_docente } = req.body;

  try {
    const rawPassword = password || `${ci}*`;
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const primerNombre = (nombre || '').trim().split(' ')[0].toLowerCase();
    const generatedUsername = username || `${primerNombre}_${ci}`;
    const generatedEmail = `${ci}@esfm.edu.bo`;

    const query = `
      INSERT INTO usuarios (
        username, correo, password_hash, rol, nombre, apellido, ci, 
        telefono, esfm_ua, especialidad, item_docente
      )
      VALUES ($1, $2, $3, 'DOCENTE_ACOMPANANTE', $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, username, nombre, apellido, ci, rol
    `;

    const values = [
      generatedUsername,
      generatedEmail,
      hashedPassword,
      nombre,
      apellido,
      ci,
      telefono || null,
      esfm_ua || "ESFM/UA - El Alto",
      especialidad || null,
      item_docente || null
    ];

    const result = await pool.query(query, values);
    return res.status(201).json({
      message: "Docente Acompañante registrado con éxito.",
      teacher: result.rows[0]
    });
  } catch (error) {
    console.error("Error al crear docente acompañante:", error);
    return res.status(500).json({ message: "Error al crear docente acompañante.", error: error.message });
  }
};

// 3. ACTUALIZAR DOCENTE ACOMPAÑANTE
export const updateTeacher = async (req, res) => {
  const { id } = req.params;
  const { username, password, nombre, apellido, ci, telefono, esfm_ua, especialidad, item_docente } = req.body;

  try {
    const generatedEmail = `${ci}@esfm.edu.bo`;

    let query = `
      UPDATE usuarios SET
        username = $1,
        correo = $2,
        nombre = $3,
        apellido = $4,
        ci = $5,
        telefono = $6,
        esfm_ua = $7,
        especialidad = $8,
        item_docente = $9
    `;
    const values = [username, generatedEmail, nombre, apellido, ci, telefono, esfm_ua, especialidad, item_docente];

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      values.push(hashedPassword);
      query += `, password_hash = $${values.length}`;
    }

    values.push(id);
    query += ` WHERE id = $${values.length} AND rol = 'DOCENTE_ACOMPANANTE' RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Docente acompañante no encontrado." });
    }

    return res.json({
      message: "Docente acompañante actualizado correctamente.",
      teacher: result.rows[0]
    });
  } catch (error) {
    console.error("Error al actualizar docente acompañante:", error);
    return res.status(500).json({ message: "Error al actualizar docente acompañante.", error: error.message });
  }
};

// 4. ELIMINAR UN DOCENTE ACOMPAÑANTE
export const deleteTeacher = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM usuarios WHERE id = $1 AND rol = 'DOCENTE_ACOMPANANTE'", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Docente acompañante no encontrado." });
    }
    return res.json({ message: "Docente acompañante eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar docente acompañante:", error);
    return res.status(500).json({ message: "Error al eliminar docente acompañante.", error: error.message });
  }
};

// 5. ELIMINACIÓN MASIVA DE DOCENTES ACOMPAÑANTES
export const deleteMultipleTeachers = async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Proporcione una lista de IDs válida." });
  }

  try {
    const result = await pool.query(
      "DELETE FROM usuarios WHERE id = ANY($1::uuid[]) AND rol = 'DOCENTE_ACOMPANANTE'",
      [ids]
    );
    return res.json({
      message: `Se eliminaron ${result.rowCount} docentes acompañantes exitosamente.`,
      count: result.rowCount
    });
  } catch (error) {
    console.error("Error en eliminación masiva de docentes:", error);
    return res.status(500).json({ message: "Error al eliminar la lista de docentes acompañantes.", error: error.message });
  }
};

// 6. IMPORTACIÓN MASIVA DESDE EXCEL
export const importBatchTeachers = async (req, res) => {
  const { docentes } = req.body;

  if (!docentes || !Array.isArray(docentes) || docentes.length === 0) {
    return res.status(400).json({ message: "Se requiere un arreglo de docentes válido." });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    let insertados = 0;

    for (const doc of docentes) {
      const rawPassword = doc.password || `${doc.ci}*`;
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      const primerNombre = (doc.nombre || '').trim().split(' ')[0].toLowerCase();
      const generatedUsername = doc.username || `${primerNombre}_${doc.ci}`;
      const generatedEmail = `${doc.ci}@esfm.edu.bo`;

      const query = `
        INSERT INTO usuarios (
          username, correo, password_hash, rol, nombre, apellido, ci, 
          telefono, esfm_ua, especialidad, item_docente
        )
        VALUES ($1, $2, $3, 'DOCENTE_ACOMPANANTE', $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (ci) DO UPDATE SET
          username = EXCLUDED.username,
          nombre = EXCLUDED.nombre,
          apellido = EXCLUDED.apellido,
          correo = EXCLUDED.correo,
          rol = 'DOCENTE_ACOMPANANTE',
          especialidad = EXCLUDED.especialidad,
          item_docente = EXCLUDED.item_docente
      `;

      const values = [
        generatedUsername,
        generatedEmail,
        hashedPassword,
        doc.nombre,
        doc.apellido,
        doc.ci,
        doc.telefono || null,
        doc.esfm_ua || "ESFM/UA - El Alto",
        doc.especialidad || null,
        doc.item_docente || doc.codigo || null
      ];

      await client.query(query, values);
      insertados++;
    }

    await client.query('COMMIT');

    return res.json({
      message: `Se registraron/actualizaron ${insertados} docentes acompañantes exitosamente.`,
      count: insertados
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error al importar docentes acompañantes:", error);
    return res.status(500).json({ message: "Error al procesar la importación masiva.", error: error.message });
  } finally {
    client.release();
  }
};