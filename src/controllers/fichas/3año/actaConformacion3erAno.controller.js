import { pool } from "../../../database/database.js";

// GET - OBTENER ACTA DE CONFORMACIÓN 3ER AÑO
export const getActaConformacion_3erAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM acta_conformacion_3er_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Acta Conformación 3er Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT ACTA DE CONFORMACIÓN)
export const saveOrUpdateActaConformacion_3erAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      lugar_ciudad = 'El Alto',
      departamento = 'La Paz',
      esfm_ua = 'ESFM Simón Bolívar / UA El Alto',
      hora = '09:00',
      dia = String(new Date().getDate()),
      mes = 'SEPTIEMBRE',
      gestion = '2026',
      ano_formacion = '3er Año de Formación',
      especialidad = '',
      integrantes = [],
      estado = 'BORRADOR'
    } = datos;

    const checkRes = await client.query(
      `SELECT id FROM acta_conformacion_3er_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE acta_conformacion_3er_ano_2026
        SET lugar_ciudad = $1,
            departamento = $2,
            esfm_ua = $3,
            hora = $4,
            dia = $5,
            mes = $6,
            gestion = $7,
            ano_formacion = $8,
            especialidad = $9,
            integrantes = $10::jsonb,
            estado = $11,
            updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $12::uuid RETURNING *;
      `;
      values = [
        lugar_ciudad, departamento, esfm_ua, hora, dia, mes,
        String(gestion).slice(0, 4), ano_formacion, especialidad,
        JSON.stringify(integrantes), estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO acta_conformacion_3er_ano_2026 (
          estudiante_id, lugar_ciudad, departamento, esfm_ua, hora,
          dia, mes, gestion, ano_formacion, especialidad, integrantes, estado
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12
        ) RETURNING *;
      `;
      values = [
        estudiante_id, lugar_ciudad, departamento, esfm_ua, hora,
        dia, mes, String(gestion).slice(0, 4), ano_formacion, especialidad,
        JSON.stringify(integrantes), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Acta de Conformación guardada correctamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Acta Conformación 3er Año:", error);
    return res.status(500).json({ message: "Error interno al guardar el acta de conformación.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR ACTA DE CONFORMACIÓN
export const deleteActaConformacion_3erAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM acta_conformacion_3er_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Acta de Conformación eliminada exitosamente." });
  } catch (error) {
    console.error("Error DELETE Acta Conformación 3er Año:", error);
    return res.status(500).json({ message: "Error al eliminar el acta.", error: error.message });
  }
};