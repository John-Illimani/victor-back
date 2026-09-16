import { pool } from "../database/database.js";

// 1. OBTENER TODAS LAS ESPECIALIDADES CON CONTEO REAL DE ESTUDIANTES Y DOCENTES
export const getEspecialidades = async (req, res) => {
  try {
    const query = `
      SELECT 
        e.id,
        e.codigo,
        e.nombre,
        e.area,
        e.estado,
        e.creado_en,
        COUNT(DISTINCT u.id) FILTER (WHERE u.rol = 'ESTUDIANTE') AS total_estudiantes,
        COUNT(DISTINCT u.id) FILTER (WHERE u.rol = 'DOCENTE_ACOMPANANTE') AS docentes_acompanantes
      FROM especialidades e
      LEFT JOIN usuarios u ON u.especialidad = e.nombre
      GROUP BY e.id
      ORDER BY e.nombre ASC;
    `;
    const result = await pool.query(query);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al obtener especialidades:", error);
    return res.status(500).json({ message: "Error al consultar las especialidades.", error: error.message });
  }
};

// 2. CREAR NUEVA ESPECIALIDAD
export const createEspecialidad = async (req, res) => {
  const { codigo, nombre, area, estado = 'Activo' } = req.body;

  if (!codigo || !nombre || !area) {
    return res.status(400).json({ message: "Los campos código, nombre y área son obligatorios." });
  }

  try {
    const query = `
      INSERT INTO especialidades (codigo, nombre, area, estado)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [codigo.trim().toUpperCase(), nombre.trim(), area.trim(), estado];
    const result = await pool.query(query, values);

    return res.status(201).json({
      message: "Especialidad creada correctamente.",
      especialidad: result.rows[0]
    });
  } catch (error) {
    console.error("Error al crear especialidad:", error);
    if (error.code === '23505') {
      return res.status(400).json({ message: "El código o el nombre de la especialidad ya existe." });
    }
    return res.status(500).json({ message: "Error al guardar la especialidad.", error: error.message });
  }
};

// 3. ACTUALIZAR ESPECIALIDAD
export const updateEspecialidad = async (req, res) => {
  const { id } = req.params;
  const { codigo, nombre, area, estado } = req.body;

  try {
    const query = `
      UPDATE especialidades
      SET codigo = COALESCE($1, codigo),
          nombre = COALESCE($2, nombre),
          area = COALESCE($3, area),
          estado = COALESCE($4, estado),
          actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *;
    `;
    const values = [codigo ? codigo.trim().toUpperCase() : null, nombre ? nombre.trim() : null, area ? area.trim() : null, estado, id];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Especialidad no encontrada." });
    }

    return res.status(200).json({
      message: "Especialidad actualizada correctamente.",
      especialidad: result.rows[0]
    });
  } catch (error) {
    console.error("Error al actualizar especialidad:", error);
    return res.status(500).json({ message: "Error al actualizar la especialidad.", error: error.message });
  }
};

// 4. ELIMINAR ESPECIALIDAD
export const deleteEspecialidad = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM especialidades WHERE id = $1 RETURNING *;`, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Especialidad no encontrada." });
    }

    return res.status(200).json({ message: "Especialidad eliminada correctamente." });
  } catch (error) {
    console.error("Error al eliminar especialidad:", error);
    return res.status(500).json({ message: "Error al eliminar la especialidad.", error: error.message });
  }
};