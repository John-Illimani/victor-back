import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA F-5
export const getFichaF5_2doAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_f5_2do_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha F5 2do Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (5 CRITERIOS Y 5 OBSERVACIONES INDEPENDIENTES)
export const saveOrUpdateFichaF5_2doAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const crit1 = Math.min(100, Math.max(0, parseFloat(datos.f5_criterio_1 ?? datos.criterio_1) || 0));
    const obs1 = datos.f5_obs_1 || datos.obs_1 || '';

    const crit2 = Math.min(100, Math.max(0, parseFloat(datos.f5_criterio_2 ?? datos.criterio_2) || 0));
    const obs2 = datos.f5_obs_2 || datos.obs_2 || '';

    const crit3 = Math.min(100, Math.max(0, parseFloat(datos.f5_criterio_3 ?? datos.criterio_3) || 0));
    const obs3 = datos.f5_obs_3 || datos.obs_3 || '';

    const crit4 = Math.min(100, Math.max(0, parseFloat(datos.f5_criterio_4 ?? datos.criterio_4) || 0));
    const obs4 = datos.f5_obs_4 || datos.obs_4 || '';

    const crit5 = Math.min(100, Math.max(0, parseFloat(datos.f5_criterio_5 ?? datos.criterio_5) || 0));
    const obs5 = datos.f5_obs_5 || datos.obs_5 || '';

    const puntFinal = Math.min(100, Math.max(0, parseFloat(datos.puntaje_final) || 0));
    const promLit = datos.promedio_literal || 'CERO CON 00/100';
    const obsGeneral = datos.observaciones || '';

    const docAcompId = (datos.docente_acompanante_id && String(datos.docente_acompanante_id).trim() !== '') ? datos.docente_acompanante_id : null;

    const ciudad = datos.lugar_ciudad || 'El Alto';
    const dep = datos.departamento || 'La Paz';
    const dia = datos.dia || String(new Date().getDate());
    const mes = datos.mes || 'SEPTIEMBRE';
    const ano = String(datos.ano || '2026').slice(0, 4);
    const nombres = datos.apellidos_nombres || '';
    const esfm = datos.esfm_ua || 'ESFM Simón Bolívar / UA El Alto';
    const anoForm = datos.ano_formacion || '2do Año de Formación';
    const est = datos.estado || 'BORRADOR';

    const checkRes = await client.query(
      `SELECT id FROM ficha_f5_2do_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_f5_2do_ano_2026
        SET f5_criterio_1 = $1, f5_obs_1 = $2,
            f5_criterio_2 = $3, f5_obs_2 = $4,
            f5_criterio_3 = $5, f5_obs_3 = $6,
            f5_criterio_4 = $7, f5_obs_4 = $8,
            f5_criterio_5 = $9, f5_obs_5 = $10,
            puntaje_final = $11, promedio_literal = $12,
            observaciones = $13, docente_acompanante_id = $14::uuid,
            apellidos_nombres = $15, esfm_ua = $16, ano_formacion = $17,
            lugar_ciudad = $18, departamento = $19, dia = $20, mes = $21, ano = $22,
            estado = $23, updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $24::uuid RETURNING *;
      `;
      values = [
        crit1, obs1, crit2, obs2, crit3, obs3, crit4, obs4, crit5, obs5,
        puntFinal, promLit, obsGeneral, docAcompId,
        nombres, esfm, anoForm, ciudad, dep, dia, mes, ano,
        est, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_f5_2do_ano_2026 (
          estudiante_id, f5_criterio_1, f5_obs_1, f5_criterio_2, f5_obs_2,
          f5_criterio_3, f5_obs_3, f5_criterio_4, f5_obs_4, f5_criterio_5, f5_obs_5,
          puntaje_final, promedio_literal, observaciones, docente_acompanante_id,
          apellidos_nombres, esfm_ua, ano_formacion, lugar_ciudad, departamento,
          dia, mes, ano, estado
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::uuid,
          $16, $17, $18, $19, $20, $21, $22, $23, $24
        ) RETURNING *;
      `;
      values = [
        estudiante_id, crit1, obs1, crit2, obs2, crit3, obs3, crit4, obs4, crit5, obs5,
        puntFinal, promLit, obsGeneral, docAcompId,
        nombres, esfm, anoForm, ciudad, dep, dia, mes, ano, est
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha F-5 guardada correctamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha F5 2do Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha F-5.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE
export const deleteFichaF5_2doAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_f5_2do_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha F-5 eliminada exitosamente." });
  } catch (error) {
    console.error("Error DELETE Ficha F5 2do Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha F-5.", error: error.message });
  }
};