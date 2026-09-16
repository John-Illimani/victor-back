import { pool } from "../../../database/database.js";

export const getFichaF2_2doAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_f2_2do_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha F2 2do Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

export const saveOrUpdateFichaF2_2doAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      dias = [],
      fecha_inicio_pec = null,
      fecha_conclusion_pec = null,
      total_dias = '10',
      total_faltas = '0',
      total_atrasos = '0',
      porcentaje_asistencia = 100,
      valoracion_100 = 0,
      promedio_literal = 'CERO CON 00/100',
      docente_guia_id = null,
      director_ue_nombre = '',
      apellidos_nombres = '',
      esfm_ua = 'ESFM Simón Bolívar / UA El Alto',
      especialidad = '',
      ano_formacion = '2do Año',
      distrito_educativo = '',
      ue_cea_cee = '',
      lugar_ciudad = 'El Alto',
      departamento = 'La Paz',
      dia = String(new Date().getDate()),
      mes = 'SEPTIEMBRE',
      ano = '2026',
      estado = 'BORRADOR'
    } = datos;

    const fInicio = (fecha_inicio_pec && String(fecha_inicio_pec).trim() !== '') ? fecha_inicio_pec : null;
    const fConc = (fecha_conclusion_pec && String(fecha_conclusion_pec).trim() !== '') ? fecha_conclusion_pec : null;
    const docGuiaId = (docente_guia_id && String(docente_guia_id).trim() !== '') ? docente_guia_id : null;

    const checkRes = await client.query(
      `SELECT id FROM ficha_f2_2do_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_f2_2do_ano_2026
        SET dias = $1::jsonb,
            fecha_inicio_pec = $2,
            fecha_conclusion_pec = $3,
            total_dias = $4,
            total_faltas = $5,
            total_atrasos = $6,
            porcentaje_asistencia = $7,
            valoracion_100 = $8,
            promedio_literal = $9,
            docente_guia_id = $10::uuid,
            director_ue_nombre = $11,
            apellidos_nombres = $12,
            esfm_ua = $13,
            especialidad = $14,
            ano_formacion = $15,
            distrito_educativo = $16,
            ue_cea_cee = $17,
            lugar_ciudad = $18,
            departamento = $19,
            dia = $20,
            mes = $21,
            ano = $22,
            estado = $23,
            updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $24::uuid RETURNING *;
      `;
      values = [
        JSON.stringify(dias), fInicio, fConc, String(total_dias),
        String(total_faltas), String(total_atrasos), porcentaje_asistencia, valoracion_100,
        promedio_literal, docGuiaId, director_ue_nombre, apellidos_nombres,
        esfm_ua, especialidad, ano_formacion, distrito_educativo, ue_cea_cee,
        lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4),
        estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_f2_2do_ano_2026 (
          estudiante_id, dias, fecha_inicio_pec, fecha_conclusion_pec,
          total_dias, total_faltas, total_atrasos, porcentaje_asistencia,
          valoracion_100, promedio_literal, docente_guia_id, director_ue_nombre,
          apellidos_nombres, esfm_ua, especialidad, ano_formacion,
          distrito_educativo, ue_cea_cee, lugar_ciudad, departamento,
          dia, mes, ano, estado
        ) VALUES (
          $1::uuid, $2::jsonb, $3, $4, $5, $6, $7, $8, $9, $10, $11::uuid,
          $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
        ) RETURNING *;
      `;
      values = [
        estudiante_id, JSON.stringify(dias), fInicio, fConc,
        String(total_dias), String(total_faltas), String(total_atrasos),
        porcentaje_asistencia, valoracion_100, promedio_literal, docGuiaId, director_ue_nombre,
        apellidos_nombres, esfm_ua, especialidad, ano_formacion,
        distrito_educativo, ue_cea_cee, lugar_ciudad, departamento,
        dia, mes, String(ano).slice(0, 4), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha F-2 guardada correctamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha F2 2do Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha F-2.", error: error.message });
  } finally {
    client.release();
  }
};

export const deleteFichaF2_2doAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_f2_2do_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha F-2 eliminada exitosamente." });
  } catch (error) {
    console.error("Error DELETE Ficha F2 2do Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha F-2.", error: error.message });
  }
};