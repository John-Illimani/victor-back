import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA B-6
export const getFichaB6_5toAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_b6_5to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha B-6 5to Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT OPTIMIZADO)
export const saveOrUpdateFichaB6_5toAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      docente_tutor_id = null,
      apellidos_nombres = '',
      v1_ser = 0, v2_ser = 0,
      v1_saber = 0, v2_saber = 0,
      v1_hacer = 0, v2_hacer = 0,
      v1_decidir = 0, v2_decidir = 0,
      obs_ser = '', obs_saber = '', obs_hacer = '', obs_decidir = '',
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

    const tutorId = (docente_tutor_id && String(docente_tutor_id).trim() !== '') ? docente_tutor_id : null;
    const f1 = (fecha_1ra_val && String(fecha_1ra_val).trim() !== '') ? fecha_1ra_val : null;
    const f2 = (fecha_2da_val && String(fecha_2da_val).trim() !== '') ? fecha_2da_val : null;
    const prom = parseNum(promedio_numeral);

    const query = `
      INSERT INTO ficha_b6_5to_ano_2026 (
        estudiante_id, docente_tutor_id, apellidos_nombres,
        v1_ser, v2_ser, v1_saber, v2_saber, v1_hacer, v2_hacer, v1_decidir, v2_decidir,
        obs_ser, obs_saber, obs_hacer, obs_decidir,
        fecha_1ra_val, fecha_2da_val, puntaje_final, promedio_numeral, promedio_literal,
        lugar_ciudad, departamento, dia, mes, ano, estado
      ) VALUES (
        $1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $18, $19, $20, $21, $22, $23, $24, $25
      )
      ON CONFLICT (estudiante_id) DO UPDATE SET
        docente_tutor_id = EXCLUDED.docente_tutor_id,
        apellidos_nombres = EXCLUDED.apellidos_nombres,
        v1_ser = EXCLUDED.v1_ser, v2_ser = EXCLUDED.v2_ser,
        v1_saber = EXCLUDED.v1_saber, v2_saber = EXCLUDED.v2_saber,
        v1_hacer = EXCLUDED.v1_hacer, v2_hacer = EXCLUDED.v2_hacer,
        v1_decidir = EXCLUDED.v1_decidir, v2_decidir = EXCLUDED.v2_decidir,
        obs_ser = EXCLUDED.obs_ser, obs_saber = EXCLUDED.obs_saber,
        obs_hacer = EXCLUDED.obs_hacer, obs_decidir = EXCLUDED.obs_decidir,
        fecha_1ra_val = EXCLUDED.fecha_1ra_val,
        fecha_2da_val = EXCLUDED.fecha_2da_val,
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
      estudiante_id, tutorId, apellidos_nombres,
      parseNum(v1_ser), parseNum(v2_ser),
      parseNum(v1_saber), parseNum(v2_saber),
      parseNum(v1_hacer), parseNum(v2_hacer),
      parseNum(v1_decidir), parseNum(v2_decidir),
      obs_ser, obs_saber, obs_hacer, obs_decidir,
      f1, f2, prom, promedio_literal,
      lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4), estado
    ];

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha B-6 de 5to Año guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha B-6 5to Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha B-6.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA B-6
export const deleteFichaB6_5toAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_b6_5to_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha B-6 eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Ficha B-6 5to Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha B-6.", error: error.message });
  }
};