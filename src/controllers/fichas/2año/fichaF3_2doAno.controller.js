import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA F-3 POR ESTUDIANTE
export const getFichaF3_2doAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_f3_2do_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha F3 2do Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (MAPEO ROBUSTO DE CRITERIOS F-3)
export const saveOrUpdateFichaF3_2doAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Captura flexible de las calificaciones enviadas
    const crit1 = Math.min(100, Math.max(0, parseFloat(datos.f3_criterio_1 ?? datos.criterio_1 ?? datos.criterio1) || 0));
    const crit2 = Math.min(100, Math.max(0, parseFloat(datos.f3_criterio_2 ?? datos.criterio_2 ?? datos.criterio2) || 0));
    const crit3 = Math.min(100, Math.max(0, parseFloat(datos.f3_criterio_3 ?? datos.criterio_3 ?? datos.criterio3) || 0));
    const crit4 = Math.min(100, Math.max(0, parseFloat(datos.f3_criterio_4 ?? datos.criterio_4 ?? datos.criterio4) || 0));

    const promNum = Math.min(100, Math.max(0, parseFloat(datos.promedio_numeral) || 0));
    const promLit = datos.promedio_literal || 'CERO CON 00/100';
    const obs = datos.observaciones || '';

    const docAcompId = (datos.docente_acompanante_id && String(datos.docente_acompanante_id).trim() !== '') ? datos.docente_acompanante_id : null;

    const ciudad = datos.lugar_ciudad || 'El Alto';
    const dep = datos.departamento || 'La Paz';
    const dia = datos.dia || String(new Date().getDate());
    const mes = datos.mes || 'SEPTIEMBRE';
    const ano = String(datos.ano || '2026').slice(0, 4);
    const nombres = datos.apellidos_nombres || '';
    const esfm = datos.esfm_ua || 'ESFM Simón Bolívar / UA El Alto';
    const esp = datos.especialidad || '';
    const est = datos.estado || 'BORRADOR';

    const checkRes = await client.query(
      `SELECT id FROM ficha_f3_2do_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_f3_2do_ano_2026
        SET f3_criterio_1 = $1,
            f3_criterio_2 = $2,
            f3_criterio_3 = $3,
            f3_criterio_4 = $4,
            promedio_numeral = $5,
            promedio_literal = $6,
            observaciones = $7,
            docente_acompanante_id = $8::uuid,
            apellidos_nombres = $9,
            esfm_ua = $10,
            especialidad = $11,
            lugar_ciudad = $12,
            departamento = $13,
            dia = $14,
            mes = $15,
            ano = $16,
            estado = $17,
            updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $18::uuid RETURNING *;
      `;
      values = [
        crit1, crit2, crit3, crit4, promNum, promLit,
        obs, docAcompId, nombres, esfm, esp, ciudad, dep,
        dia, mes, ano, est, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_f3_2do_ano_2026 (
          estudiante_id, f3_criterio_1, f3_criterio_2, f3_criterio_3, f3_criterio_4,
          promedio_numeral, promedio_literal, observaciones, docente_acompanante_id,
          apellidos_nombres, esfm_ua, especialidad, lugar_ciudad, departamento,
          dia, mes, ano, estado
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9::uuid,
          $10, $11, $12, $13, $14, $15, $16, $17, $18
        ) RETURNING *;
      `;
      values = [
        estudiante_id, crit1, crit2, crit3, crit4, promNum, promLit,
        obs, docAcompId, nombres, esfm, esp, ciudad, dep,
        dia, mes, ano, est
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha F-3 guardada correctamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha F3 2do Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha F-3.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA F-3
export const deleteFichaF3_2doAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_f3_2do_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha F-3 eliminada exitosamente." });
  } catch (error) {
    console.error("Error DELETE Ficha F3 2do Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha F-3.", error: error.message });
  }
};