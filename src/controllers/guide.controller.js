import bcrypt from "bcryptjs";
import { pool } from "../database/database.js";

// 1. OBTENER DOCENTES GUÍA CON FORMULARIOS HABILITADOS Y CONTEO DE ESTUDIANTES
export const getGuides = async (req, res) => {
  try {
    const query = `
      SELECT 
        d.id, d.username, d.correo, d.nombre, d.apellido, d.ci, 
        d.telefono, d.rol, d.esfm_ua, d.especialidad, d.item_docente, d.creado_en,
        COALESCE(d.formularios_habilitados, '{}'::jsonb) AS formularios_habilitados,
        COUNT(ade.estudiante_id)::INT AS estudiantes_asignados_count
      FROM usuarios d
      LEFT JOIN asignaciones_docente_estudiante ade ON d.id = ade.docente_id
      WHERE d.rol = 'DOCENTE_GUIA'
      GROUP BY d.id
      ORDER BY d.creado_en DESC
    `;
    const result = await pool.query(query);
    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener docentes guía:", error);
    return res.status(500).json({ message: "Error al consultar docentes guía.", error: error.message });
  }
};

// 2. CREAR DOCENTE GUÍA
export const createGuide = async (req, res) => {
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
      VALUES ($1, $2, $3, 'DOCENTE_GUIA', $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, username, correo, nombre, apellido, ci, telefono, rol, esfm_ua, especialidad, item_docente, creado_en
    `;

    const values = [
      generatedUsername, generatedEmail, hashedPassword,
      nombre, apellido, ci, telefono || null,
      esfm_ua || "U.E. Franz Tamayo", especialidad || null, item_docente || null
    ];

    const result = await pool.query(query, values);
    return res.status(201).json({ message: "Docente guía registrado con éxito.", guide: result.rows[0] });
  } catch (error) {
    console.error("Error al crear docente guía:", error);
    return res.status(500).json({ message: "Error al crear docente guía.", error: error.message });
  }
};

// 3. ACTUALIZAR DOCENTE GUÍA
export const updateGuide = async (req, res) => {
  const { id } = req.params;
  const { username, password, nombre, apellido, ci, telefono, esfm_ua, especialidad, item_docente } = req.body;

  try {
    const generatedEmail = `${ci}@esfm.edu.bo`;
    let query = `
      UPDATE usuarios SET
        username = $1, correo = $2, nombre = $3, apellido = $4,
        ci = $5, telefono = $6, esfm_ua = $7, especialidad = $8, item_docente = $9
    `;
    const values = [username, generatedEmail, nombre, apellido, ci, telefono, esfm_ua, especialidad, item_docente];

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      values.push(hashedPassword);
      query += `, password_hash = $${values.length}`;
    }

    values.push(id);
    query += ` WHERE id = $${values.length} AND rol = 'DOCENTE_GUIA' RETURNING *`;

    const result = await pool.query(query, values);
    if (result.rowCount === 0) return res.status(404).json({ message: "Docente guía no encontrado." });

    return res.json({ message: "Docente guía actualizado correctamente.", guide: result.rows[0] });
  } catch (error) {
    console.error("Error al actualizar docente guía:", error);
    return res.status(500).json({ message: "Error al actualizar docente guía.", error: error.message });
  }
};

// 4. ELIMINAR DOCENTE GUÍA
export const deleteGuide = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM usuarios WHERE id = $1 AND rol = 'DOCENTE_GUIA'", [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: "Docente guía no encontrado." });
    return res.json({ message: "Docente guía eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar docente guía:", error);
    return res.status(500).json({ message: "Error al eliminar docente guía.", error: error.message });
  }
};

// 5. ELIMINACIÓN MASIVA
export const deleteMultipleGuides = async (req, res) => {
  const { ids } = req.body;
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Proporcione una lista de IDs válida." });
  }

  try {
    const result = await pool.query(
      "DELETE FROM usuarios WHERE id = ANY($1::uuid[]) AND rol = 'DOCENTE_GUIA'",
      [ids]
    );
    return res.json({ message: `Se eliminaron ${result.rowCount} docentes guía exitosamente.`, count: result.rowCount });
  } catch (error) {
    console.error("Error en eliminación masiva de docentes guía:", error);
    return res.status(500).json({ message: "Error al eliminar los docentes guía.", error: error.message });
  }
};

// 6. IMPORTACIÓN MASIVA DESDE EXCEL
export const importBatchGuides = async (req, res) => {
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
        VALUES ($1, $2, $3, 'DOCENTE_GUIA', $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (ci) DO UPDATE SET
          username = EXCLUDED.username,
          nombre = EXCLUDED.nombre,
          apellido = EXCLUDED.apellido,
          correo = EXCLUDED.correo,
          rol = 'DOCENTE_GUIA',
          esfm_ua = EXCLUDED.esfm_ua,
          especialidad = EXCLUDED.especialidad,
          item_docente = EXCLUDED.item_docente
      `;

      const values = [
        generatedUsername, generatedEmail, hashedPassword,
        doc.nombre, doc.apellido, doc.ci, doc.telefono || null,
        doc.esfm_ua || "U.E. Franz Tamayo", doc.especialidad || null, doc.codigo || null
      ];

      await client.query(query, values);
      insertados++;
    }

    await client.query('COMMIT');
    return res.json({ message: `Se registraron/actualizaron ${insertados} docentes guía exitosamente.`, count: insertados });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error en importación masiva de docentes guía:", error);
    return res.status(500).json({ message: "Error al procesar la importación masiva.", error: error.message });
  } finally {
    client.release();
  }
};

// 7. OBTENER ESTUDIANTES ASIGNADOS AL DOCENTE GUÍA
export const getAssignedStudents = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        e.id, e.username, e.correo, e.nombre, e.apellido, e.ci, e.telefono, 
        e.rol, e.estado, e.esfm_ua, e.especialidad, e.genero, e.modalidad_ingreso, 
        e.ano_formacion, ade.fecha_asignacion, ade.id AS asignacion_id
      FROM usuarios e
      INNER JOIN asignaciones_docente_estudiante ade ON e.id = ade.estudiante_id
      WHERE ade.docente_id = $1::uuid AND e.rol = 'ESTUDIANTE'
      ORDER BY e.apellido ASC, e.nombre ASC
    `;
    const result = await pool.query(query, [id]);
    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener estudiantes asignados:", error);
    return res.status(500).json({ message: "Error al consultar asignaciones.", error: error.message });
  }
};

// 8. ASIGNAR ESTUDIANTE AL DOCENTE GUÍA
export const assignStudentToGuide = async (req, res) => {
  const { docente_id, estudiante_id } = req.body;
  try {
    const query = `
      INSERT INTO asignaciones_docente_estudiante (docente_id, estudiante_id, gestion)
      VALUES ($1::uuid, $2::uuid, '2026')
      ON CONFLICT (docente_id, estudiante_id, gestion) DO NOTHING
      RETURNING *;
    `;
    const result = await pool.query(query, [docente_id, estudiante_id]);
    
    if (result.rowCount === 0) {
      return res.status(400).json({ message: "El estudiante ya se encuentra asignado a este docente guía." });
    }

    return res.status(201).json({ message: "Estudiante asignado correctamente.", asignacion: result.rows[0] });
  } catch (error) {
    console.error("Error al asignar estudiante:", error);
    return res.status(500).json({ message: "Error al realizar la asignación.", error: error.message });
  }
};

// 9. DESASIGNAR ESTUDIANTE DEL DOCENTE GUÍA
export const unassignStudentFromGuide = async (req, res) => {
  const { docente_id, estudiante_id } = req.body;
  try {
    const query = `
      DELETE FROM asignaciones_docente_estudiante
      WHERE docente_id = $1::uuid AND estudiante_id = $2::uuid;
    `;
    const result = await pool.query(query, [docente_id, estudiante_id]);
    return res.json({ message: "Asignación removida con éxito.", count: result.rowCount });
  } catch (error) {
    console.error("Error al quitar asignación:", error);
    return res.status(500).json({ message: "Error al revocar la asignación.", error: error.message });
  }
};

// 10. TOGGLE HABILITAR/DESHABILITAR FORMULARIO AL DOCENTE GUÍA
export const toggleFormularioGuide = async (req, res) => {
  const { docente_id, formulario_key, habilitado } = req.body;
  try {
    const query = `
      UPDATE usuarios
      SET formularios_habilitados = jsonb_set(
        COALESCE(formularios_habilitados, '{}'::jsonb),
        ARRAY[$1::text],
        to_jsonb($2::boolean)
      )
      WHERE id = $3::uuid AND rol = 'DOCENTE_GUIA'
      RETURNING id, formularios_habilitados;
    `;
    const result = await pool.query(query, [formulario_key, habilitado, docente_id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Docente guía no encontrado." });
    }

    return res.json({ message: "Permiso de formulario actualizado correctamente.", guide: result.rows[0] });
  } catch (error) {
    console.error("Error al actualizar formulario del docente guía:", error);
    return res.status(500).json({ message: "Error al guardar configuración de formulario.", error: error.message });
  }
};