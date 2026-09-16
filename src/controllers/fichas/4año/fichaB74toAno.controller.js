import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA B-7
export const getFichaB7_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_b7_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha B-7 4to Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT)
export const saveOrUpdateFichaB7_4toAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      esfm_ua = 'ESFM Simón Bolívar / UA El Alto',
      especialidad = '',
      integrantes_ectg = '',
      ue_cea_cee = '',
      fecha_evaluacion = null,
      evaluaciones = {},
      promedio_numeral = 0,
      promedio_literal = 'CERO CON 00/100',
      lugar_ciudad = 'El Alto',
      departamento = 'La Paz',
      dia = String(new Date().getDate()),
      mes = 'SEPTIEMBRE',
      ano = '2026',
      estado = 'GUARDADO'
    } = datos;

    const fEval = (fecha_evaluacion && String(fecha_evaluacion).trim() !== '') ? fecha_evaluacion : null;
    const prom = parseFloat(promedio_numeral) || 0;

    const checkRes = await client.query(
      `SELECT id FROM ficha_b7_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_b7_4to_ano_2026
        SET esfm_ua = $1,
            especialidad = $2,
            integrantes_ectg = $3,
            ue_cea_cee = $4,
            fecha_evaluacion = $5,
            evaluaciones = $6::jsonb,
            promedio_numeral = $7,
            promedio_literal = $8,
            lugar_ciudad = $9,
            departamento = $10,
            dia = $11,
            mes = $12,
            ano = $13,
            estado = $14,
            updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $15::uuid RETURNING *;
      `;
      values = [
        esfm_ua, especialidad, integrantes_ectg, ue_cea_cee,
        fEval, JSON.stringify(evaluaciones), prom, promedio_literal,
        lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4),
        estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_b7_4to_ano_2026 (
          estudiante_id, esfm_ua, especialidad, integrantes_ectg, ue_cea_cee,
          fecha_evaluacion, evaluaciones, promedio_numeral, promedio_literal,
          lugar_ciudad, departamento, dia, mes, ano, estado
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12, $13, $14, $15
        ) RETURNING *;
      `;
      values = [
        estudiante_id, esfm_ua, especialidad, integrantes_ectg, ue_cea_cee,
        fEval, JSON.stringify(evaluaciones), prom, promedio_literal,
        lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha B-7 guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha B-7 4to Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha B-7.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA B-7
export const deleteFichaB7_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_b7_4to_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha B-7 eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Ficha B-7 4to Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha B-7.", error: error.message });
  }
};