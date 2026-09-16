import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA F-6 POR ESTUDIANTE
export const getFichaF6_2doAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_f6_2do_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha F6 2do Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT FICHA F-6)
export const saveOrUpdateFichaF6_2doAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cuali1 = datos.f6_val_cualitativa_1 || datos.val_cualitativa_1 || '';
    const crit1 = Math.min(100, Math.max(0, parseFloat(datos.f6_criterio_1 ?? datos.criterio_1) || 0));

    const cuali2 = datos.f6_val_cualitativa_2 || datos.val_cualitativa_2 || '';
    const crit2 = Math.min(100, Math.max(0, parseFloat(datos.f6_criterio_2 ?? datos.criterio_2) || 0));

    const cuali3 = datos.f6_val_cualitativa_3 || datos.val_cualitativa_3 || '';
    const crit3 = Math.min(100, Math.max(0, parseFloat(datos.f6_criterio_3 ?? datos.criterio_3) || 0));

    const cuali4 = datos.f6_val_cualitativa_4 || datos.val_cualitativa_4 || '';
    const crit4 = Math.min(100, Math.max(0, parseFloat(datos.f6_criterio_4 ?? datos.criterio_4) || 0));

    const cuali5 = datos.f6_val_cualitativa_5 || datos.val_cualitativa_5 || '';
    const crit5 = Math.min(100, Math.max(0, parseFloat(datos.f6_criterio_5 ?? datos.criterio_5) || 0));

    const promNum = Math.min(100, Math.max(0, parseFloat(datos.promedio_numeral ?? datos.promedio_final) || 0));
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
      `SELECT id FROM ficha_f6_2do_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_f6_2do_ano_2026
        SET f6_val_cualitativa_1 = $1, f6_criterio_1 = $2,
            f6_val_cualitativa_2 = $3, f6_criterio_2 = $4,
            f6_val_cualitativa_3 = $5, f6_criterio_3 = $6,
            f6_val_cualitativa_4 = $7, f6_criterio_4 = $8,
            f6_val_cualitativa_5 = $9, f6_criterio_5 = $10,
            promedio_numeral = $11, promedio_literal = $12,
            observaciones = $13, docente_acompanante_id = $14::uuid,
            apellidos_nombres = $15, esfm_ua = $16, ano_formacion = $17,
            lugar_ciudad = $18, departamento = $19, dia = $20, mes = $21, ano = $22,
            estado = $23, updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $24::uuid RETURNING *;
      `;
      values = [
        cuali1, crit1, cuali2, crit2, cuali3, crit3,
        cuali4, crit4, cuali5, crit5,
        promNum, promLit, obsGeneral, docAcompId,
        nombres, esfm, anoForm, ciudad, dep, dia, mes, ano,
        est, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_f6_2do_ano_2026 (
          estudiante_id,
          f6_val_cualitativa_1, f6_criterio_1,
          f6_val_cualitativa_2, f6_criterio_2,
          f6_val_cualitativa_3, f6_criterio_3,
          f6_val_cualitativa_4, f6_criterio_4,
          f6_val_cualitativa_5, f6_criterio_5,
          promedio_numeral, promedio_literal, observaciones, docente_acompanante_id,
          apellidos_nombres, esfm_ua, ano_formacion, lugar_ciudad, departamento,
          dia, mes, ano, estado
        ) VALUES (
          $1::uuid,
          $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15::uuid,
          $16, $17, $18, $19, $20, $21, $22, $23, $24
        ) RETURNING *;
      `;
      values = [
        estudiante_id,
        cuali1, crit1, cuali2, crit2, cuali3, crit3,
        cuali4, crit4, cuali5, crit5,
        promNum, promLit, obsGeneral, docAcompId,
        nombres, esfm, anoForm, ciudad, dep, dia, mes, ano, est
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha F-6 guardada correctamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha F6 2do Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha F-6.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA F-6
export const deleteFichaF6_2doAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_f6_2do_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha F-6 eliminada exitosamente." });
  } catch (error) {
    console.error("Error DELETE Ficha F6 2do Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha F-6.", error: error.message });
  }
};