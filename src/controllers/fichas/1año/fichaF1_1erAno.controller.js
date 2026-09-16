import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA F-1 POR ESTUDIANTE
export const getFichaF1_1erAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM ficha_f1_1er_ano_2026 WHERE estudiante_id = $1 LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha F1 1er Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT)
export const saveOrUpdateFichaF1_1erAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Mapeo robusto: captura tanto f1_criterio_X como posibles nombres antiguos del objeto de configuración
    const crit1 = Math.min(100, Math.max(0, parseFloat(datos.f1_criterio_1 ?? datos.plan_accion_criterio1) || 0));
    const crit2 = Math.min(100, Math.max(0, parseFloat(datos.f1_criterio_2 ?? datos.plan_accion_criterio2) || 0));
    const crit3 = Math.min(100, Math.max(0, parseFloat(datos.f1_criterio_3 ?? datos.instrumentos_criterio1) || 0));
    const crit4 = Math.min(100, Math.max(0, parseFloat(datos.f1_criterio_4 ?? datos.instrumentos_criterio2) || 0));

    const promNum = parseFloat(datos.promedio_numeral) || 0;
    const promLit = datos.promedio_literal || 'CERO CON 00/100';
    const obs = datos.observaciones || '';

    const docId = (datos.docente_investigacion_id && String(datos.docente_investigacion_id).trim() !== '') ? datos.docente_investigacion_id : null;
    const eqId = (datos.equipo_id && String(datos.equipo_id).trim() !== '') ? datos.equipo_id : null;

    const ciudad = datos.lugar_ciudad || 'El Alto';
    const dep = datos.departamento || 'La Paz';
    const dia = datos.dia || String(new Date().getDate());
    const mes = datos.mes || 'ENERO';
    const ano = String(datos.ano || '2026').slice(0, 4);
    const nombres = datos.apellidos_nombres || '';
    const esfm = datos.esfm_ua || 'ESFM Simón Bolívar / UA El Alto';
    const esp = datos.especialidad || '';
    const est = datos.estado || 'BORRADOR';

    const checkRes = await client.query(
      `SELECT id FROM ficha_f1_1er_ano_2026 WHERE estudiante_id = $1 LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_f1_1er_ano_2026
        SET equipo_id = $1,
            f1_criterio_1 = $2,
            f1_criterio_2 = $3,
            f1_criterio_3 = $4,
            f1_criterio_4 = $5,
            promedio_numeral = $6,
            promedio_literal = $7,
            observaciones = $8,
            docente_investigacion_id = $9,
            lugar_ciudad = $10,
            departamento = $11,
            dia = $12,
            mes = $13,
            ano = $14,
            apellidos_nombres = $15,
            esfm_ua = $16,
            especialidad = $17,
            estado = $18
        WHERE estudiante_id = $19 RETURNING *;
      `;
      values = [
        eqId, crit1, crit2, crit3, crit4, promNum, promLit,
        obs, docId, ciudad, dep, dia, mes, ano, nombres,
        esfm, esp, est, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_f1_1er_ano_2026 (
          estudiante_id, equipo_id, f1_criterio_1, f1_criterio_2, f1_criterio_3,
          f1_criterio_4, promedio_numeral, promedio_literal, observaciones,
          docente_investigacion_id, lugar_ciudad, departamento, dia, mes, ano,
          apellidos_nombres, esfm_ua, especialidad, estado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING *;
      `;
      values = [
        estudiante_id, eqId, crit1, crit2, crit3, crit4, promNum,
        promLit, obs, docId, ciudad, dep, dia, mes, ano,
        nombres, esfm, esp, est
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha F-1 guardada correctamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha F1:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha F-1.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA F-1
export const deleteFichaF1_1erAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_f1_1er_ano_2026 WHERE estudiante_id = $1 RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha F-1 eliminada exitosamente." });
  } catch (error) {
    console.error("Error DELETE Ficha F1:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha F-1.", error: error.message });
  }
};