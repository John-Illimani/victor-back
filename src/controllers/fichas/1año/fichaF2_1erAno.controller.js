import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA F-2 POR ESTUDIANTE
export const getFichaF2_1erAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM ficha_f2_1er_ano_2026 WHERE estudiante_id = $1 LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha F2 1er Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT)
export const saveOrUpdateFichaF2_1erAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      actividades_dia1 = '',
      actividades_dia2 = '',
      actividades_dia3 = '',
      actividades_dia4 = '',
      actividades_dia5 = '',
      fecha_inicio_pec = null,
      fecha_conclusion_pec = null,
      total_dias = '5',
      total_faltas = '0',
      total_atrasos = '0',
      porcentaje_asistencia = '100',
      valoracion_100 = '100',
      docente_guia_id = null,
      director_ue_nombre = '',
      lugar_ciudad = 'El Alto',
      departamento = 'La Paz',
      dia = String(new Date().getDate()),
      mes = 'SEPTIEMBRE',
      ano = '2026',
      apellidos_nombres = '',
      esfm_ua = 'ESFM Simón Bolívar / UA El Alto',
      especialidad = '',
      estado = 'BORRADOR'
    } = datos;

    const pAsis = Math.min(100, Math.max(0, parseFloat(porcentaje_asistencia) || 100));
    const val100 = Math.min(100, Math.max(1, parseInt(valoracion_100) || 100));
    const docGuiaId = (docente_guia_id && String(docente_guia_id).trim() !== '') ? docente_guia_id : null;
    const fInicio = (fecha_inicio_pec && String(fecha_inicio_pec).trim() !== '') ? fecha_inicio_pec : null;
    const fConc = (fecha_conclusion_pec && String(fecha_conclusion_pec).trim() !== '') ? fecha_conclusion_pec : null;

    const checkRes = await client.query(
      `SELECT id FROM ficha_f2_1er_ano_2026 WHERE estudiante_id = $1 LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_f2_1er_ano_2026
        SET actividades_dia1 = $1,
            actividades_dia2 = $2,
            actividades_dia3 = $3,
            actividades_dia4 = $4,
            actividades_dia5 = $5,
            fecha_inicio_pec = $6,
            fecha_conclusion_pec = $7,
            total_dias = $8,
            total_faltas = $9,
            total_atrasos = $10,
            porcentaje_asistencia = $11,
            valoracion_100 = $12,
            docente_guia_id = $13,
            director_ue_nombre = $14,
            lugar_ciudad = $15,
            departamento = $16,
            dia = $17,
            mes = $18,
            ano = $19,
            apellidos_nombres = $20,
            esfm_ua = $21,
            especialidad = $22,
            estado = $23
        WHERE estudiante_id = $24 RETURNING *;
      `;
      values = [
        actividades_dia1, actividades_dia2, actividades_dia3, actividades_dia4, actividades_dia5,
        fInicio, fConc, String(total_dias), String(total_faltas), String(total_atrasos), pAsis, val100,
        docGuiaId, director_ue_nombre, lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4),
        apellidos_nombres, esfm_ua, especialidad, estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_f2_1er_ano_2026 (
          estudiante_id, actividades_dia1, actividades_dia2, actividades_dia3, actividades_dia4,
          actividades_dia5, fecha_inicio_pec, fecha_conclusion_pec, total_dias, total_faltas,
          total_atrasos, porcentaje_asistencia, valoracion_100, docente_guia_id, director_ue_nombre,
          lugar_ciudad, departamento, dia, mes, ano, apellidos_nombres, esfm_ua, especialidad, estado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        RETURNING *;
      `;
      values = [
        estudiante_id, actividades_dia1, actividades_dia2, actividades_dia3, actividades_dia4,
        actividades_dia5, fInicio, fConc, String(total_dias), String(total_faltas), String(total_atrasos),
        pAsis, val100, docGuiaId, director_ue_nombre, lugar_ciudad, departamento, dia, mes,
        String(ano).slice(0, 4), apellidos_nombres, esfm_ua, especialidad, estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha F-2 guardada correctamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha F2:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha F-2.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA F-2
export const deleteFichaF2_1erAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_f2_1er_ano_2026 WHERE estudiante_id = $1 RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha F-2 eliminada exitosamente." });
  } catch (error) {
    console.error("Error DELETE Ficha F2:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha F-2.", error: error.message });
  }
};