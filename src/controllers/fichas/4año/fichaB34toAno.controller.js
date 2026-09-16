import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA B-3
export const getFichaB3_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_b3_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha B-3 4to Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT)
export const saveOrUpdateFichaB3_4toAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      apellidos_nombres = '',
      nota_planificacion = 0,
      nota_desarrollo_contenidos = 0,
      nota_estrategias = 0,
      nota_evaluacion = 0,
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
      `SELECT id FROM ficha_b3_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_b3_4to_ano_2026
        SET apellidos_nombres = $1,
            nota_planificacion = $2,
            nota_desarrollo_contenidos = $3,
            nota_estrategias = $4,
            nota_evaluacion = $5,
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
        apellidos_nombres,
        parseNum(nota_planificacion),
        parseNum(nota_desarrollo_contenidos),
        parseNum(nota_estrategias),
        parseNum(nota_evaluacion),
        prom, promedio_literal, observaciones,
        lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4),
        estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_b3_4to_ano_2026 (
          estudiante_id, apellidos_nombres,
          nota_planificacion, nota_desarrollo_contenidos, nota_estrategias, nota_evaluacion,
          promedio_numeral, promedio_literal, observaciones,
          lugar_ciudad, departamento, dia, mes, ano, estado
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
        ) RETURNING *;
      `;
      values = [
        estudiante_id, apellidos_nombres,
        parseNum(nota_planificacion),
        parseNum(nota_desarrollo_contenidos),
        parseNum(nota_estrategias),
        parseNum(nota_evaluacion),
        prom, promedio_literal, observaciones,
        lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha B-3 guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha B-3 4to Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha B-3.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA B-3
export const deleteFichaB3_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_b3_4to_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha B-3 eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Ficha B-3 4to Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha B-3.", error: error.message });
  }
};