import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA B-1
export const getFichaB1_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_b1_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha B-1 4to Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT)
export const saveOrUpdateFichaB1_4toAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      apellidos_nombres = '',
      fecha_inicio = null,
      fecha_conclusion = null,
      semanas = {},
      promedio_numeral = 100,
      promedio_literal = 'CIEN CON 00/100',
      observaciones = '',
      lugar_ciudad = 'El Alto',
      departamento = 'La Paz',
      dia = String(new Date().getDate()),
      mes = 'SEPTIEMBRE',
      ano = '2026',
      estado = 'GUARDADO'
    } = datos;

    const fInicio = (fecha_inicio && String(fecha_inicio).trim() !== '') ? fecha_inicio : null;
    const fConc = (fecha_conclusion && String(fecha_conclusion).trim() !== '') ? fecha_conclusion : null;
    const prom = parseFloat(promedio_numeral) || 0;

    const checkRes = await client.query(
      `SELECT id FROM ficha_b1_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_b1_4to_ano_2026
        SET apellidos_nombres = $1,
            fecha_inicio = $2,
            fecha_conclusion = $3,
            semanas = $4::jsonb,
            promedio_numeral = $5,
            promedio_literal = $6,
            observaciones = $7,
            lugar_ciudad = $8,
            departamento = $9,
            dia = $10,
            mes = $11,
            ano = $12,
            estado = $13,
            updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $14::uuid RETURNING *;
      `;
      values = [
        apellidos_nombres, fInicio, fConc, JSON.stringify(semanas),
        prom, promedio_literal, observaciones, lugar_ciudad, departamento,
        dia, mes, String(ano).slice(0, 4), estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_b1_4to_ano_2026 (
          estudiante_id, apellidos_nombres, fecha_inicio, fecha_conclusion,
          semanas, promedio_numeral, promedio_literal, observaciones,
          lugar_ciudad, departamento, dia, mes, ano, estado
        ) VALUES (
          $1::uuid, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11, $12, $13, $14
        ) RETURNING *;
      `;
      values = [
        estudiante_id, apellidos_nombres, fInicio, fConc, JSON.stringify(semanas),
        prom, promedio_literal, observaciones, lugar_ciudad, departamento,
        dia, mes, String(ano).slice(0, 4), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha B-1 guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha B-1 4to Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha B-1.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA B-1
export const deleteFichaB1_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_b1_4to_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha B-1 eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Ficha B-1 4to Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha B-1.", error: error.message });
  }
};