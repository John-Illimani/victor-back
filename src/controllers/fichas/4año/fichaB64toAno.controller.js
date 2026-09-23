import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA B-6
export const getFichaB6_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_b6_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha B-6 4to Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT)
export const saveOrUpdateFichaB6_4toAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      apellidos_nombres = '',
      ser_a = 0, ser_b = 0,
      saber_a = 0, saber_b = 0,
      hacer_a = 0, hacer_b = 0,
      decidir_a = 0, decidir_b = 0,
      fecha_1ra_val = null,
      fecha_2da_val = null,
      promedio_numeral = 0,
      promedio_literal = 'CERO CON 00/100',
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

    const f1 = (fecha_1ra_val && String(fecha_1ra_val).trim() !== '') ? fecha_1ra_val : null;
    const f2 = (fecha_2da_val && String(fecha_2da_val).trim() !== '') ? fecha_2da_val : null;
    const prom = parseNum(promedio_numeral);

    const checkRes = await client.query(
      `SELECT id FROM ficha_b6_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_b6_4to_ano_2026
        SET apellidos_nombres = $1,
            ser_a = $2, ser_b = $3,
            saber_a = $4, saber_b = $5,
            hacer_a = $6, hacer_b = $7,
            decidir_a = $8, decidir_b = $9,
            fecha_1ra_val = $10,
            fecha_2da_val = $11,
            promedio_numeral = $12,
            promedio_literal = $13,
            lugar_ciudad = $14,
            departamento = $15,
            dia = $16,
            mes = $17,
            ano = $18,
            estado = $19,
            updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $20::uuid RETURNING *;
      `;
      values = [
        apellidos_nombres,
        parseNum(ser_a), parseNum(ser_b),
        parseNum(saber_a), parseNum(saber_b),
        parseNum(hacer_a), parseNum(hacer_b),
        parseNum(decidir_a), parseNum(decidir_b),
        f1, f2, prom, promedio_literal,
        lugar_ciudad, departamento, String(dia), mes, String(ano).slice(0, 4),
        estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_b6_4to_ano_2026 (
          estudiante_id, apellidos_nombres,
          ser_a, ser_b, saber_a, saber_b, hacer_a, hacer_b, decidir_a, decidir_b,
          fecha_1ra_val, fecha_2da_val, promedio_numeral, promedio_literal,
          lugar_ciudad, departamento, dia, mes, ano, estado
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        ) RETURNING *;
      `;
      values = [
        estudiante_id, apellidos_nombres,
        parseNum(ser_a), parseNum(ser_b),
        parseNum(saber_a), parseNum(saber_b),
        parseNum(hacer_a), parseNum(hacer_b),
        parseNum(decidir_a), parseNum(decidir_b),
        f1, f2, prom, promedio_literal,
        lugar_ciudad, departamento, String(dia), mes, String(ano).slice(0, 4), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha B-6 guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha B-6 4to Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha B-6.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA B-6
export const deleteFichaB6_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_b6_4to_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha B-6 eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Ficha B-6 4to Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha B-6.", error: error.message });
  }
};