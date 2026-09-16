import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA B-4
export const getFichaB4_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_b4_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha B-4 4to Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT)
export const saveOrUpdateFichaB4_4toAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      apellidos_nombres = '',
      pdc1 = 0, pdc2 = 0, pdc3 = 0, pdc4 = 0, pdc5 = 0, clase_comunitaria = 0,
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

    const prom = parseNum(promedio_numeral);

    const checkRes = await client.query(
      `SELECT id FROM ficha_b4_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_b4_4to_ano_2026
        SET apellidos_nombres = $1,
            pdc1 = $2, pdc2 = $3, pdc3 = $4, pdc4 = $5, pdc5 = $6, clase_comunitaria = $7,
            promedio_numeral = $8,
            promedio_literal = $9,
            lugar_ciudad = $10,
            departamento = $11,
            dia = $12,
            mes = $13,
            ano = $14,
            estado = $15,
            updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $16::uuid RETURNING *;
      `;
      values = [
        apellidos_nombres,
        parseNum(pdc1), parseNum(pdc2), parseNum(pdc3), parseNum(pdc4), parseNum(pdc5), parseNum(clase_comunitaria),
        prom, promedio_literal,
        lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4),
        estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_b4_4to_ano_2026 (
          estudiante_id, apellidos_nombres,
          pdc1, pdc2, pdc3, pdc4, pdc5, clase_comunitaria,
          promedio_numeral, promedio_literal,
          lugar_ciudad, departamento, dia, mes, ano, estado
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        ) RETURNING *;
      `;
      values = [
        estudiante_id, apellidos_nombres,
        parseNum(pdc1), parseNum(pdc2), parseNum(pdc3), parseNum(pdc4), parseNum(pdc5), parseNum(clase_comunitaria),
        prom, promedio_literal,
        lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha B-4 guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha B-4 4to Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha B-4.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA B-4
export const deleteFichaB4_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_b4_4to_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha B-4 eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Ficha B-4 4to Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha B-4.", error: error.message });
  }
};