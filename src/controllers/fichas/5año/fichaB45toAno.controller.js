import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA B-4
export const getFichaB4_5toAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_b4_5to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha B-4 5to Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT OPTIMIZADO PARA ALTO TRÁFICO)
export const saveOrUpdateFichaB4_5toAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      apellidos_nombres = '',
      pdc_1 = 0, pdc_2 = 0, pdc_3 = 0, pdc_4 = 0, pdc_5 = 0,
      pdc_6 = 0, pdc_7 = 0, pdc_8 = 0, pdc_9 = 0, clase_comunitaria = 0,
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

    const query = `
      INSERT INTO ficha_b4_5to_ano_2026 (
        estudiante_id, apellidos_nombres,
        pdc_1, pdc_2, pdc_3, pdc_4, pdc_5, pdc_6, pdc_7, pdc_8, pdc_9, clase_comunitaria,
        puntaje_final, promedio_numeral, promedio_literal,
        lugar_ciudad, departamento, dia, mes, ano, estado
      ) VALUES (
        $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13, $14, $15, $16, $17, $18, $19, $20
      )
      ON CONFLICT (estudiante_id) DO UPDATE SET
        apellidos_nombres = EXCLUDED.apellidos_nombres,
        pdc_1 = EXCLUDED.pdc_1,
        pdc_2 = EXCLUDED.pdc_2,
        pdc_3 = EXCLUDED.pdc_3,
        pdc_4 = EXCLUDED.pdc_4,
        pdc_5 = EXCLUDED.pdc_5,
        pdc_6 = EXCLUDED.pdc_6,
        pdc_7 = EXCLUDED.pdc_7,
        pdc_8 = EXCLUDED.pdc_8,
        pdc_9 = EXCLUDED.pdc_9,
        clase_comunitaria = EXCLUDED.clase_comunitaria,
        puntaje_final = EXCLUDED.puntaje_final,
        promedio_numeral = EXCLUDED.promedio_numeral,
        promedio_literal = EXCLUDED.promedio_literal,
        lugar_ciudad = EXCLUDED.lugar_ciudad,
        departamento = EXCLUDED.departamento,
        dia = EXCLUDED.dia,
        mes = EXCLUDED.mes,
        ano = EXCLUDED.ano,
        estado = EXCLUDED.estado,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const values = [
      estudiante_id, apellidos_nombres,
      parseNum(pdc_1), parseNum(pdc_2), parseNum(pdc_3), parseNum(pdc_4), parseNum(pdc_5),
      parseNum(pdc_6), parseNum(pdc_7), parseNum(pdc_8), parseNum(pdc_9), parseNum(clase_comunitaria),
      prom, promedio_literal,
      lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4), estado
    ];

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha B-4 de 5to Año guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha B-4 5to Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha B-4.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA B-4
export const deleteFichaB4_5toAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_b4_5to_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha B-4 eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Ficha B-4 5to Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha B-4.", error: error.message });
  }
};