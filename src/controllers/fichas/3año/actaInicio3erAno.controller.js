import { pool } from "../../../database/database.js";

// GET - OBTENER ACTA DE INICIO 3ER AÑO
export const getActaInicio_3erAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM acta_inicio_3er_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Acta Inicio 3er Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT ACTA DE INICIO)
export const saveOrUpdateActaInicio_3erAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      apellidos_nombres = '',
      esfm_ua = 'ESFM Simón Bolívar / UA El Alto',
      especialidad = '',
      departamento = 'La Paz',
      distrito_educativo = '',
      subsistema = 'Educación Regular',
      nivel = 'Nivel Secundaria',
      ue_cea_cee = '',
      anos_escolaridad_asignado = '',
      fecha_inicio_pec = null,
      fecha_conclusion_pec = null,
      docente_guia_id = null,
      docente_acompanante_id = null,
      integrantes = [],
      estado = 'BORRADOR'
    } = datos;

    const fInicio = (fecha_inicio_pec && String(fecha_inicio_pec).trim() !== '') ? fecha_inicio_pec : null;
    const fConc = (fecha_conclusion_pec && String(fecha_conclusion_pec).trim() !== '') ? fecha_conclusion_pec : null;
    const docGuiaId = (docente_guia_id && String(docente_guia_id).trim() !== '') ? docente_guia_id : null;
    const docAcompId = (docente_acompanante_id && String(docente_acompanante_id).trim() !== '') ? docente_acompanante_id : null;

    const checkRes = await client.query(
      `SELECT id FROM acta_inicio_3er_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE acta_inicio_3er_ano_2026
        SET apellidos_nombres = $1,
            esfm_ua = $2,
            especialidad = $3,
            departamento = $4,
            distrito_educativo = $5,
            subsistema = $6,
            nivel = $7,
            ue_cea_cee = $8,
            anos_escolaridad_asignado = $9,
            fecha_inicio_pec = $10,
            fecha_conclusion_pec = $11,
            docente_guia_id = $12::uuid,
            docente_acompanante_id = $13::uuid,
            integrantes = $14::jsonb,
            estado = $15,
            updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $16::uuid RETURNING *;
      `;
      values = [
        apellidos_nombres, esfm_ua, especialidad, departamento, distrito_educativo,
        subsistema, nivel, ue_cea_cee, anos_escolaridad_asignado,
        fInicio, fConc, docGuiaId, docAcompId, JSON.stringify(integrantes),
        estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO acta_inicio_3er_ano_2026 (
          estudiante_id, apellidos_nombres, esfm_ua, especialidad, departamento,
          distrito_educativo, subsistema, nivel, ue_cea_cee, anos_escolaridad_asignado,
          fecha_inicio_pec, fecha_conclusion_pec, docente_guia_id, docente_acompanante_id,
          integrantes, estado
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::uuid, $14::uuid, $15::jsonb, $16
        ) RETURNING *;
      `;
      values = [
        estudiante_id, apellidos_nombres, esfm_ua, especialidad, departamento,
        distrito_educativo, subsistema, nivel, ue_cea_cee, anos_escolaridad_asignado,
        fInicio, fConc, docGuiaId, docAcompId, JSON.stringify(integrantes), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Acta de Inicio guardada correctamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Acta Inicio 3er Año:", error);
    return res.status(500).json({ message: "Error interno al guardar el Acta de Inicio.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR ACTA DE INICIO
export const deleteActaInicio_3erAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM acta_inicio_3er_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Acta de Inicio eliminada exitosamente." });
  } catch (error) {
    console.error("Error DELETE Acta Inicio 3er Año:", error);
    return res.status(500).json({ message: "Error al eliminar el acta.", error: error.message });
  }
};