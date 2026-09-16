import { pool } from "../../../database/database.js";

// GET - OBTENER ACTA DE SOCIALIZACIÓN POR ESTUDIANTE
export const getActaSocializacion_3erAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM acta_socializacion_3er_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Acta Socialización 3er Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - UPSERT CON TRANSACCIÓN ATÓMICA
export const saveOrUpdateActaSocializacion_3erAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      lugar_ciudad = 'El Alto',
      distrito = 'Distrito 1',
      hora = '10:00',
      dia = String(new Date().getDate()),
      mes = 'SEPTIEMBRE',
      gestion = '2026',
      especialidad = '',
      ue_cea_cee = '',
      observacion_1 = '',
      observacion_2 = '',
      observacion_3 = '',
      observacion_4 = '',
      estado = 'BORRADOR'
    } = datos;

    const checkRes = await client.query(
      `SELECT id FROM acta_socializacion_3er_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE acta_socializacion_3er_ano_2026
        SET lugar_ciudad = $1,
            distrito = $2,
            hora = $3,
            dia = $4,
            mes = $5,
            gestion = $6,
            especialidad = $7,
            ue_cea_cee = $8,
            observacion_1 = $9,
            observacion_2 = $10,
            observacion_3 = $11,
            observacion_4 = $12,
            estado = $13,
            updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $14::uuid RETURNING *;
      `;
      values = [
        lugar_ciudad, distrito, hora, dia, mes, String(gestion).slice(0, 4),
        especialidad, ue_cea_cee, observacion_1, observacion_2,
        observacion_3, observacion_4, estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO acta_socializacion_3er_ano_2026 (
          estudiante_id, lugar_ciudad, distrito, hora, dia, mes,
          gestion, especialidad, ue_cea_cee, observacion_1,
          observacion_2, observacion_3, observacion_4, estado
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
        ) RETURNING *;
      `;
      values = [
        estudiante_id, lugar_ciudad, distrito, hora, dia, mes,
        String(gestion).slice(0, 4), especialidad, ue_cea_cee,
        observacion_1, observacion_2, observacion_3, observacion_4, estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Acta de Socialización guardada correctamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Acta Socialización 3er Año:", error);
    return res.status(500).json({ message: "Error interno al guardar el acta.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR REGISTRO
export const deleteActaSocializacion_3erAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM acta_socializacion_3er_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Acta de Socialización eliminada exitosamente." });
  } catch (error) {
    console.error("Error DELETE Acta Socialización 3er Año:", error);
    return res.status(500).json({ message: "Error al eliminar el registro.", error: error.message });
  }
};