import { pool } from "../../../database/database.js";

// 1. OBTENER ACTA POR ESTUDIANTE
export const getActaConformacion1erAno = async (req, res) => {
  const { estudiante_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM acta_conformacion_1er_ano_2026 WHERE estudiante_id = $1 LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }

    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Acta Conformación 1er Año:", error);
    return res.status(500).json({ message: "Error interno al consultar la base de datos.", error: error.message });
  }
};

// 2. CREAR NUEVA ACTA
export const createActaConformacion1erAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y el objeto de datos." });
  }

  try {
    const {
      lugar_ciudad = 'El Alto',
      departamento = 'La Paz',
      esfm_predios = 'ESFM Simón Bolívar / UA El Alto',
      hora = '09:00',
      dia = String(new Date().getDate()),
      mes = 'ENERO',
      gestion = '2026',
      ano_formacion = '1er Año',
      especialidad = '',
      integrantes = []
    } = datos;

    const query = `
      INSERT INTO acta_conformacion_1er_ano_2026 (
        estudiante_id, lugar_ciudad, departamento, esfm_predios, hora,
        dia, mes, gestion, ano_formacion, especialidad, integrantes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
      RETURNING *;
    `;

    const values = [
      estudiante_id, lugar_ciudad, departamento, esfm_predios, hora,
      dia, mes, gestion, ano_formacion, especialidad, JSON.stringify(integrantes)
    ];

    const result = await pool.query(query, values);
    return res.status(201).json({ message: "Acta registrada correctamente.", datos: result.rows[0] });
  } catch (error) {
    console.error("Error POST Acta Conformación 1er Año:", error);
    return res.status(500).json({ message: "Error al crear el registro.", error: error.message });
  }
};

// 3. ACTUALIZAR ACTA EXISTENTE
export const updateActaConformacion1erAno = async (req, res) => {
  const { estudiante_id } = req.params;
  // Maneja si datos viene directo o dentro de req.body.datos
  const datos = req.body.datos || req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Parámetros de actualización incompletos." });
  }

  try {
    const {
      lugar_ciudad, departamento, esfm_predios, hora, dia, mes, gestion,
      ano_formacion, especialidad, integrantes
    } = datos;

    const query = `
      UPDATE acta_conformacion_1er_ano_2026
      SET lugar_ciudad = COALESCE($1, lugar_ciudad),
          departamento = COALESCE($2, departamento),
          esfm_predios = COALESCE($3, esfm_predios),
          hora = COALESCE($4, hora),
          dia = COALESCE($5, dia),
          mes = COALESCE($6, mes),
          gestion = COALESCE($7, gestion),
          ano_formacion = COALESCE($8, ano_formacion),
          especialidad = COALESCE($9, especialidad),
          integrantes = COALESCE($10::jsonb, integrantes),
          actualizado_en = CURRENT_TIMESTAMP
      WHERE estudiante_id = $11
      RETURNING *;
    `;

    const values = [
      lugar_ciudad, departamento, esfm_predios, hora, dia, mes, gestion,
      ano_formacion, especialidad, integrantes ? JSON.stringify(integrantes) : null,
      estudiante_id
    ];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "No se encontró el acta para actualizar." });
    }

    return res.status(200).json({ message: "Acta actualizada correctamente.", datos: result.rows[0] });
  } catch (error) {
    console.error("Error PUT Acta Conformación 1er Año:", error);
    return res.status(500).json({ message: "Error al actualizar la información.", error: error.message });
  }
};

// 4. ELIMINAR REGISTRO INDIVIDUAL
export const deleteActaConformacion1erAno = async (req, res) => {
  const { estudiante_id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM acta_conformacion_1er_ano_2026 WHERE estudiante_id = $1 RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }

    return res.status(200).json({ message: "Acta eliminada exitosamente." });
  } catch (error) {
    console.error("Error DELETE Acta Conformación 1er Año:", error);
    return res.status(500).json({ message: "Error al eliminar el registro.", error: error.message });
  }
};

// 5. UPSERT (AUTOMÁTICO GUARDAR/ACTUALIZAR)
export const saveOrUpdateActaConformacion1erAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Datos incompletos para guardar." });
  }

  try {
    const checkRes = await pool.query(
      `SELECT id FROM acta_conformacion_1er_ano_2026 WHERE estudiante_id = $1 LIMIT 1`,
      [estudiante_id]
    );

    if (checkRes.rowCount > 0) {
      req.params.estudiante_id = estudiante_id;
      return await updateActaConformacion1erAno(req, res);
    } else {
      return await createActaConformacion1erAno(req, res);
    }
  } catch (error) {
    console.error("Error UPSERT Acta Conformación 1er Año:", error);
    return res.status(500).json({ message: "Error al procesar la solicitud.", error: error.message });
  }
};