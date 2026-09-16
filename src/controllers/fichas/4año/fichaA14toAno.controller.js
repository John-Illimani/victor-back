import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA A-1 4TO AÑO
export const getFichaA1_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_a1_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha A-1 4to Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT)
export const saveOrUpdateFichaA1_4toAno = async (req, res) => {
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
      ano_formacion = '4to Año',
      especialidad = '',
      tecnicas_evaluacion = [],
      c1_diseno_validacion = 0,
      c2_aplicacion_tecnicas = 0,
      c3_orden_analisis = 0,
      promedio_numeral = 0,
      promedio_literal = 'CERO CON 00/100',
      observaciones = '',
      lugar_ciudad = 'El Alto',
      departamento = 'La Paz',
      dia = String(new Date().getDate()),
      mes = 'SEPTIEMBRE',
      ano = '2026',
      estado = 'GUARDADO'
    } = datos;

    const parseNum = (val) => {
      const num = parseFloat(val);
      return isNaN(num) ? 0 : num;
    };

    const c1 = parseNum(c1_diseno_validacion);
    const c2 = parseNum(c2_aplicacion_tecnicas);
    const c3 = parseNum(c3_orden_analisis);
    const prom = parseNum(promedio_numeral);

    const checkRes = await client.query(
      `SELECT id FROM ficha_a1_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_a1_4to_ano_2026
        SET apellidos_nombres = $1,
            esfm_ua = $2,
            ano_formacion = $3,
            especialidad = $4,
            tecnicas_evaluacion = $5::jsonb,
            c1_diseno_validacion = $6,
            c2_aplicacion_tecnicas = $7,
            c3_orden_analisis = $8,
            puntaje_final = $9,
            promedio_numeral = $9,
            promedio_literal = $10,
            observaciones = $11,
            lugar_ciudad = $12,
            departamento = $13,
            dia = $14,
            mes = $15,
            ano = $16,
            estado = $17,
            updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $18::uuid RETURNING *;
      `;
      values = [
        apellidos_nombres, esfm_ua, ano_formacion, especialidad,
        JSON.stringify(tecnicas_evaluacion), c1, c2, c3, prom, promedio_literal,
        observaciones, lugar_ciudad, departamento, dia, mes,
        String(ano).slice(0, 4), estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_a1_4to_ano_2026 (
          estudiante_id, apellidos_nombres, esfm_ua, ano_formacion, especialidad,
          tecnicas_evaluacion, c1_diseno_validacion, c2_aplicacion_tecnicas, c3_orden_analisis,
          puntaje_final, promedio_numeral, promedio_literal, observaciones,
          lugar_ciudad, departamento, dia, mes, ano, estado
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $10, $11, $12, $13, $14, $15, $16, $17, $18
        ) RETURNING *;
      `;
      values = [
        estudiante_id, apellidos_nombres, esfm_ua, ano_formacion, especialidad,
        JSON.stringify(tecnicas_evaluacion), c1, c2, c3, prom, promedio_literal,
        observaciones, lugar_ciudad, departamento, dia, mes,
        String(ano).slice(0, 4), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha A-1 guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha A-1 4to Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha A-1.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA A-1
export const deleteFichaA1_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_a1_4to_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha A-1 eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Ficha A-1 4to Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha A-1.", error: error.message });
  }
};