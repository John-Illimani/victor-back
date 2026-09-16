import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA B-2
export const getFichaB2_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_b2_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha B-2 4to Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT)
export const saveOrUpdateFichaB2_4toAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      apellidos_nombres = '',
      columnas_pdc = ['PDC 1', 'PDC 2', 'PDC 3', 'PDC 4', 'PDC 5'],
      calificaciones = {},
      promedios_pdc = {},
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

    const prom = parseFloat(promedio_numeral) || 0;

    const checkRes = await client.query(
      `SELECT id FROM ficha_b2_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_b2_4to_ano_2026
        SET apellidos_nombres = $1,
            columnas_pdc = $2::jsonb,
            calificaciones = $3::jsonb,
            promedios_pdc = $4::jsonb,
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
        apellidos_nombres, JSON.stringify(columnas_pdc), JSON.stringify(calificaciones),
        JSON.stringify(promedios_pdc), prom, promedio_literal, observaciones,
        lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4),
        estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_b2_4to_ano_2026 (
          estudiante_id, apellidos_nombres, columnas_pdc, calificaciones, promedios_pdc,
          promedio_numeral, promedio_literal, observaciones, lugar_ciudad, departamento,
          dia, mes, ano, estado
        ) VALUES (
          $1::uuid, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6, $7, $8, $9, $10, $11, $12, $13, $14
        ) RETURNING *;
      `;
      values = [
        estudiante_id, apellidos_nombres, JSON.stringify(columnas_pdc), JSON.stringify(calificaciones),
        JSON.stringify(promedios_pdc), prom, promedio_literal, observaciones,
        lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha B-2 guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha B-2 4to Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha B-2.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA B-2
export const deleteFichaB2_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_b2_4to_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha B-2 eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Ficha B-2 4to Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha B-2.", error: error.message });
  }
};