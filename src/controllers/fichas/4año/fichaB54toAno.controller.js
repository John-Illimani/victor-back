import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA B-5
export const getFichaB5_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_b5_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha B-5 4to Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT)
export const saveOrUpdateFichaB5_4toAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      apellidos_nombres = '',
      c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0, c6 = 0,
      c7 = 0, c8 = 0, c9 = 0, c10 = 0, c11 = 0, c12 = 0,
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

    const prom = parseNum(promedio_numeral);

    const checkRes = await client.query(
      `SELECT id FROM ficha_b5_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_b5_4to_ano_2026
        SET apellidos_nombres = $1,
            c1 = $2, c2 = $3, c3 = $4, c4 = $5, c5 = $6, c6 = $7,
            c7 = $8, c8 = $9, c9 = $10, c10 = $11, c11 = $12, c12 = $13,
            promedio_numeral = $14,
            promedio_literal = $15,
            observaciones = $16,
            lugar_ciudad = $17,
            departamento = $18,
            dia = $19,
            mes = $20,
            ano = $21,
            estado = $22,
            updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $23::uuid RETURNING *;
      `;
      values = [
        apellidos_nombres,
        parseNum(c1), parseNum(c2), parseNum(c3), parseNum(c4), parseNum(c5), parseNum(c6),
        parseNum(c7), parseNum(c8), parseNum(c9), parseNum(c10), parseNum(c11), parseNum(c12),
        prom, promedio_literal, observaciones,
        lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4),
        estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_b5_4to_ano_2026 (
          estudiante_id, apellidos_nombres,
          c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12,
          promedio_numeral, promedio_literal, observaciones,
          lugar_ciudad, departamento, dia, mes, ano, estado
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
        ) RETURNING *;
      `;
      values = [
        estudiante_id, apellidos_nombres,
        parseNum(c1), parseNum(c2), parseNum(c3), parseNum(c4), parseNum(c5), parseNum(c6),
        parseNum(c7), parseNum(c8), parseNum(c9), parseNum(c10), parseNum(c11), parseNum(c12),
        prom, promedio_literal, observaciones,
        lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha B-5 guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha B-5 4to Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha B-5.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA B-5
export const deleteFichaB5_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_b5_4to_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha B-5 eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Ficha B-5 4to Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha B-5.", error: error.message });
  }
};