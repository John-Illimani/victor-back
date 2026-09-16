import { pool } from "../../../database/database.js";

// GET - OBTENER ACTA FINAL
export const getActaFinal_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM acta_final_evaluacion_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Acta Final 4to Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT)
export const saveOrUpdateActaFinal_4toAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      esfm_ua = 'ESFM Simón Bolívar / UA El Alto',
      lugar_ciudad = 'El Alto',
      hora_acta = '08:00',
      dia_acta = String(new Date().getDate()),
      mes_acta = 'SEPTIEMBRE',
      ano_acta = '2026',
      titulo_diseno = '',
      modalidad_graduacion = '',
      integrantes = [],
      departamento = 'La Paz',
      dia = String(new Date().getDate()),
      mes = 'SEPTIEMBRE',
      ano = '2026',
      estado = 'GUARDADO'
    } = datos;

    const checkRes = await client.query(
      `SELECT id FROM acta_final_evaluacion_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE acta_final_evaluacion_4to_ano_2026
        SET esfm_ua = $1,
            lugar_ciudad = $2,
            hora_acta = $3,
            dia_acta = $4,
            mes_acta = $5,
            ano_acta = $6,
            titulo_diseno = $7,
            modalidad_graduacion = $8,
            integrantes = $9::jsonb,
            departamento = $10,
            dia = $11,
            mes = $12,
            ano = $13,
            estado = $14,
            updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $15::uuid RETURNING *;
      `;
      values = [
        esfm_ua, lugar_ciudad, hora_acta, dia_acta, mes_acta, String(ano_acta).slice(0, 4),
        titulo_diseno, modalidad_graduacion, JSON.stringify(integrantes),
        departamento, dia, mes, String(ano).slice(0, 4), estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO acta_final_evaluacion_4to_ano_2026 (
          estudiante_id, esfm_ua, lugar_ciudad, hora_acta, dia_acta, mes_acta, ano_acta,
          titulo_diseno, modalidad_graduacion, integrantes, departamento, dia, mes, ano, estado
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12, $13, $14, $15
        ) RETURNING *;
      `;
      values = [
        estudiante_id, esfm_ua, lugar_ciudad, hora_acta, dia_acta, mes_acta, String(ano_acta).slice(0, 4),
        titulo_diseno, modalidad_graduacion, JSON.stringify(integrantes),
        departamento, dia, mes, String(ano).slice(0, 4), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Acta Final guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Acta Final 4to Año:", error);
    return res.status(500).json({ message: "Error interno al guardar el Acta Final.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR ACTA FINAL
export const deleteActaFinal_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM acta_final_evaluacion_4to_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Acta Final eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Acta Final 4to Año:", error);
    return res.status(500).json({ message: "Error al eliminar el Acta Final.", error: error.message });
  }
};