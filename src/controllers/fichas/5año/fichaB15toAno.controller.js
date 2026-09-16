import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA B-1 5TO AÑO
export const getFichaB1_5toAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_b1_5to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha B-1 5to Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT OPTIMIZADO)
export const saveOrUpdateFichaB1_5toAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      apellidos_nombres = '',
      semanas_data = {},
      fecha_inicio_pec = null,
      fecha_conclusion_pec = null,
      total_dias = 0,
      total_faltas = 0,
      total_atrasos = 0,
      porcentaje_asistencia = 100,
      valoracion_100 = 100,
      promedio_literal = 'CIEN CON 00/100',
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

    const fInicio = (fecha_inicio_pec && String(fecha_inicio_pec).trim() !== '') ? fecha_inicio_pec : null;
    const fConc = (fecha_conclusion_pec && String(fecha_conclusion_pec).trim() !== '') ? fecha_conclusion_pec : null;
    const val100 = parseNum(valoracion_100);

    const query = `
      INSERT INTO ficha_b1_5to_ano_2026 (
        estudiante_id, apellidos_nombres, semanas_data, fecha_inicio_pec, fecha_conclusion_pec,
        total_dias, total_faltas, total_atrasos, porcentaje_asistencia, valoracion_100,
        promedio_numeral, promedio_literal, lugar_ciudad, departamento, dia, mes, ano, estado
      ) VALUES (
        $1::uuid, $2, $3::jsonb, $4, $5, $6, $7, $8, $9, $10, $10, $11, $12, $13, $14, $15, $16, $17
      )
      ON CONFLICT (estudiante_id) DO UPDATE SET
        apellidos_nombres = EXCLUDED.apellidos_nombres,
        semanas_data = EXCLUDED.semanas_data,
        fecha_inicio_pec = EXCLUDED.fecha_inicio_pec,
        fecha_conclusion_pec = EXCLUDED.fecha_conclusion_pec,
        total_dias = EXCLUDED.total_dias,
        total_faltas = EXCLUDED.total_faltas,
        total_atrasos = EXCLUDED.total_atrasos,
        porcentaje_asistencia = EXCLUDED.porcentaje_asistencia,
        valoracion_100 = EXCLUDED.valoracion_100,
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
      estudiante_id, apellidos_nombres, JSON.stringify(semanas_data), fInicio, fConc,
      parseNum(total_dias), parseNum(total_faltas), parseNum(total_atrasos), parseNum(porcentaje_asistencia),
      val100, promedio_literal, lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4), estado
    ];

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha B-1 de 5to Año guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha B-1 5to Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha B-1.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA B-1
export const deleteFichaB1_5toAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_b1_5to_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha B-1 eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Ficha B-1 5to Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha B-1.", error: error.message });
  }
};