import { pool } from "../../../database/database.js";

// GET - OBTENER ACTA DE INICIO 2DO AÑO POR ESTUDIANTE
export const getActaInicio_2doAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM acta_inicio_2do_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Acta de Inicio 2do Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT)
export const saveOrUpdateActaInicio_2doAno = async (req, res) => {
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
      paralelo = 'ej A',
      gestion = '2026',
      distrito_educativo = '',
      ue_cea_cee = '',
      especialidad_iepc = '',
      anos_escolaridad_paralelos = '',
      subsistema = 'Educación Regular',
      nivel = 'Primaria Comunitaria Vocacional',
      fecha_inicio_pec = null,
      fecha_conclusion_pec = null,
      director_ue_nombre = '',
      lugar_ciudad = 'El Alto',
      departamento = 'La Paz',
      dia = String(new Date().getDate()),
      mes = 'SEPTIEMBRE',
      integrantes = [],
      estado = 'BORRADOR'
    } = datos;

    const fInicio = (fecha_inicio_pec && String(fecha_inicio_pec).trim() !== '') ? fecha_inicio_pec : null;
    const fConc = (fecha_conclusion_pec && String(fecha_conclusion_pec).trim() !== '') ? fecha_conclusion_pec : null;

    const checkRes = await client.query(
      `SELECT id FROM acta_inicio_2do_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE acta_inicio_2do_ano_2026
        SET apellidos_nombres = $1,
            esfm_ua = $2,
            especialidad = $3,
            paralelo = $4,
            gestion = $5,
            distrito_educativo = $6,
            ue_cea_cee = $7,
            especialidad_iepc = $8,
            anos_escolaridad_paralelos = $9,
            subsistema = $10,
            nivel = $11,
            fecha_inicio_pec = $12,
            fecha_conclusion_pec = $13,
            director_ue_nombre = $14,
            lugar_ciudad = $15,
            departamento = $16,
            dia = $17,
            mes = $18,
            integrantes = $19::jsonb,
            estado = $20,
            updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $21::uuid RETURNING *;
      `;
      values = [
        apellidos_nombres, esfm_ua, especialidad, paralelo, gestion,
        distrito_educativo, ue_cea_cee, especialidad_iepc, anos_escolaridad_paralelos,
        subsistema, nivel, fInicio, fConc, director_ue_nombre,
        lugar_ciudad, departamento, dia, mes, JSON.stringify(integrantes),
        estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO acta_inicio_2do_ano_2026 (
          estudiante_id, apellidos_nombres, esfm_ua, especialidad, paralelo,
          gestion, distrito_educativo, ue_cea_cee, especialidad_iepc,
          anos_escolaridad_paralelos, subsistema, nivel, fecha_inicio_pec,
          fecha_conclusion_pec, director_ue_nombre, lugar_ciudad, departamento,
          dia, mes, integrantes, estado
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
          $14, $15, $16, $17, $18, $19, $20::jsonb, $21
        ) RETURNING *;
      `;
      values = [
        estudiante_id, apellidos_nombres, esfm_ua, especialidad, paralelo,
        gestion, distrito_educativo, ue_cea_cee, especialidad_iepc,
        anos_escolaridad_paralelos, subsistema, nivel, fInicio,
        fConc, director_ue_nombre, lugar_ciudad, departamento,
        dia, mes, JSON.stringify(integrantes), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Acta de Inicio guardada correctamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Acta de Inicio 2do Año:", error);
    return res.status(500).json({ message: "Error interno al guardar el Acta de Inicio.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR ACTA DE INICIO
export const deleteActaInicio_2doAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM acta_inicio_2do_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Acta de Inicio eliminada exitosamente." });
  } catch (error) {
    console.error("Error DELETE Acta de Inicio:", error);
    return res.status(500).json({ message: "Error al eliminar el Acta de Inicio.", error: error.message });
  }
};