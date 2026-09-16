import { pool } from "../../../database/database.js";

export const getFichaA1_3erAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_a1_3er_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha A-1 3er Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

export const saveOrUpdateFichaA1_3erAno = async (req, res) => {
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
      ano_formacion = '3er Año',
      especialidad = '',
      tecnicas_evaluacion = [],
      puntaje_final = 0,
      promedio_literal = 'CERO CON 00/100',
      observaciones = '',
      lugar_ciudad = 'El Alto',
      departamento = 'La Paz',
      dia = String(new Date().getDate()),
      mes = 'SEPTIEMBRE',
      ano = '2026',
      estado = 'GUARDADO'
    } = datos;

    const pf = parseFloat(puntaje_final) || 0;

    const checkRes = await client.query(
      `SELECT id FROM ficha_a1_3er_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_a1_3er_ano_2026
        SET apellidos_nombres = $1,
            esfm_ua = $2,
            ano_formacion = $3,
            especialidad = $4,
            tecnicas_evaluacion = $5::jsonb,
            puntaje_final = $6,
            promedio_numeral = $6,
            promedio_literal = $7,
            observaciones = $8,
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
        apellidos_nombres, esfm_ua, ano_formacion, especialidad,
        JSON.stringify(tecnicas_evaluacion), pf, promedio_literal,
        observaciones, lugar_ciudad, departamento, dia, mes,
        String(ano).slice(0, 4), estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_a1_3er_ano_2026 (
          estudiante_id, apellidos_nombres, esfm_ua, ano_formacion, especialidad,
          tecnicas_evaluacion, puntaje_final, promedio_numeral, promedio_literal,
          observaciones, lugar_ciudad, departamento, dia, mes, ano, estado
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6::jsonb, $7, $7, $8, $9, $10, $11, $12, $13, $14, $15
        ) RETURNING *;
      `;
      values = [
        estudiante_id, apellidos_nombres, esfm_ua, ano_formacion, especialidad,
        JSON.stringify(tecnicas_evaluacion), pf, promedio_literal,
        observaciones, lugar_ciudad, departamento, dia, mes,
        String(ano).slice(0, 4), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha A-1 guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha A-1 3er Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha A-1.", error: error.message });
  } finally {
    client.release();
  }
};

export const deleteFichaA1_3erAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_a1_3er_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha A-1 eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Ficha A-1 3er Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha A-1.", error: error.message });
  }
};