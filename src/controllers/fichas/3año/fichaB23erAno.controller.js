import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA B-2 POR ESTUDIANTE
export const getFichaB2_3erAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_b2_3er_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha B-2 3er Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT)
export const saveOrUpdateFichaB2_3erAno = async (req, res) => {
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
      fecha_inicio_pec = null,
      fecha_conclusion_pec = null,
      semanas = [],
      promedio_numeral = 0,
      promedio_literal = 'CERO CON 00/100',
      docente_guia_id = null,
      director_ue_nombre = '',
      lugar_ciudad = 'El Alto',
      departamento = 'La Paz',
      dia = String(new Date().getDate()),
      mes = 'SEPTIEMBRE',
      ano = '2026',
      estado = 'GUARDADO'
    } = datos;

    const fInicio = (fecha_inicio_pec && String(fecha_inicio_pec).trim() !== '') ? fecha_inicio_pec : null;
    const fConc = (fecha_conclusion_pec && String(fecha_conclusion_pec).trim() !== '') ? fecha_conclusion_pec : null;
    const docGuiaId = (docente_guia_id && String(docente_guia_id).trim() !== '') ? docente_guia_id : null;
    const prom = parseFloat(promedio_numeral) || 0;

    const checkRes = await client.query(
      `SELECT id FROM ficha_b2_3er_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_b2_3er_ano_2026
        SET apellidos_nombres = $1,
            esfm_ua = $2,
            especialidad = $3,
            fecha_inicio_pec = $4,
            fecha_conclusion_pec = $5,
            semanas = $6::jsonb,
            promedio_numeral = $7,
            promedio_literal = $8,
            docente_guia_id = $9::uuid,
            director_ue_nombre = $10,
            lugar_ciudad = $11,
            departamento = $12,
            dia = $13,
            mes = $14,
            ano = $15,
            estado = $16,
            updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $17::uuid RETURNING *;
      `;
      values = [
        apellidos_nombres, esfm_ua, especialidad, fInicio, fConc,
        JSON.stringify(semanas), prom, promedio_literal, docGuiaId,
        director_ue_nombre, lugar_ciudad, departamento, dia, mes,
        String(ano).slice(0, 4), estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_b2_3er_ano_2026 (
          estudiante_id, apellidos_nombres, esfm_ua, especialidad,
          fecha_inicio_pec, fecha_conclusion_pec, semanas, promedio_numeral,
          promedio_literal, docente_guia_id, director_ue_nombre, lugar_ciudad,
          departamento, dia, mes, ano, estado
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10::uuid, $11, $12, $13, $14, $15, $16, $17
        ) RETURNING *;
      `;
      values = [
        estudiante_id, apellidos_nombres, esfm_ua, especialidad,
        fInicio, fConc, JSON.stringify(semanas), prom, promedio_literal,
        docGuiaId, director_ue_nombre, lugar_ciudad, departamento,
        dia, mes, String(ano).slice(0, 4), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha B-2 guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha B-2 3er Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha B-2.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA B-2
export const deleteFichaB2_3erAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_b2_3er_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha B-2 eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Ficha B-2 3er Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha B-2.", error: error.message });
  }
};