import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA C-1 5TO AÑO
export const getFichaC1_5toAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_c1_5to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha C-1 5to Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT OPTIMIZADO PARA ALTO TRÁFICO)
export const saveOrUpdateFichaC1_5toAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      docente_tutor_id = null,
      estudiante_nombre = '',
      integrantes_ectg = [],
      departamento_pec = 'La Paz',
      distrito_educativo = '',
      ue_cea_cee = '',
      subsistema = '',
      curso_area = '',
      fecha_pec_inicio = null,
      fecha_pec_fin = null,
      notas_criterios = {},
      promedio_numeral = 0,
      promedio_literal = 'CERO CON 00/100',
      sugerencias_recomendaciones = '',
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
    const fInicio = (fecha_pec_inicio && String(fecha_pec_inicio).trim() !== '') ? fecha_pec_inicio : null;
    const fFin = (fecha_pec_fin && String(fecha_pec_fin).trim() !== '') ? fecha_pec_fin : null;
    const prom = parseNum(promedio_numeral);

    const query = `
      INSERT INTO ficha_c1_5to_ano_2026 (
        estudiante_id, docente_tutor_id, estudiante_nombre,
        integrantes_ectg, departamento_pec, distrito_educativo, ue_cea_cee,
        subsistema, curso_area, fecha_pec_inicio, fecha_pec_fin,
        notas_criterios, puntaje_final, promedio_numeral, promedio_literal,
        sugerencias_recomendaciones, lugar_ciudad, departamento, dia, mes, ano, estado
      ) VALUES (
        $1::uuid, $2::uuid, $3, $4::jsonb, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13, $13, $14, $15, $16, $17, $18, $19, $20, $21
      )
      ON CONFLICT (estudiante_id) DO UPDATE SET
        docente_tutor_id = EXCLUDED.docente_tutor_id,
        estudiante_nombre = EXCLUDED.estudiante_nombre,
        integrantes_ectg = EXCLUDED.integrantes_ectg,
        departamento_pec = EXCLUDED.departamento_pec,
        distrito_educativo = EXCLUDED.distrito_educativo,
        ue_cea_cee = EXCLUDED.ue_cea_cee,
        subsistema = EXCLUDED.subsistema,
        curso_area = EXCLUDED.curso_area,
        fecha_pec_inicio = EXCLUDED.fecha_pec_inicio,
        fecha_pec_fin = EXCLUDED.fecha_pec_fin,
        notas_criterios = EXCLUDED.notas_criterios,
        puntaje_final = EXCLUDED.puntaje_final,
        promedio_numeral = EXCLUDED.promedio_numeral,
        promedio_literal = EXCLUDED.promedio_literal,
        sugerencias_recomendaciones = EXCLUDED.sugerencias_recomendaciones,
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
      estudiante_id, tutorId, estudiante_nombre,
      JSON.stringify(integrantes_ectg), departamento_pec, distrito_educativo, ue_cea_cee,
      subsistema, curso_area, fInicio, fFin,
      JSON.stringify(notas_criterios), prom, promedio_literal,
      sugerencias_recomendaciones, lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4), estado
    ];

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha C-1 de 5to Año guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha C-1 5to Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha C-1.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA C-1
export const deleteFichaC1_5toAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_c1_5to_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha C-1 eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Ficha C-1 5to Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha C-1.", error: error.message });
  }
};