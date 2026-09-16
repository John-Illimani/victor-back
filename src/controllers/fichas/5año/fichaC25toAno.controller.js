import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA C-2 5TO AÑO
export const getFichaC2_5toAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_c2_5to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha C-2 5to Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT OPTIMIZADO)
export const saveOrUpdateFichaC2_5toAno = async (req, res) => {
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
      departamento_pec = 'La Paz',
      distrito_educativo = '',
      ue_cea_cee = '',
      subsistema = '',
      curso_area = '',
      fecha_pec_inicio = null,
      fecha_pec_fin = null,
      modalidad_graduacion = '',
      titulo_trabajo_grado = '',
      integrantes = [],
      promedio_numeral = 0,
      promedio_literal = 'CERO CON 00/100',
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
      INSERT INTO ficha_c2_5to_ano_2026 (
        estudiante_id, docente_tutor_id, estudiante_nombre,
        departamento_pec, distrito_educativo, ue_cea_cee, subsistema, curso_area,
        fecha_pec_inicio, fecha_pec_fin, modalidad_graduacion, titulo_trabajo_grado,
        integrantes, puntaje_final, promedio_numeral, promedio_literal,
        lugar_ciudad, departamento, dia, mes, ano, estado
      ) VALUES (
        $1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14, $14, $15, $16, $17, $18, $19, $20, $21
      )
      ON CONFLICT (estudiante_id) DO UPDATE SET
        docente_tutor_id = EXCLUDED.docente_tutor_id,
        estudiante_nombre = EXCLUDED.estudiante_nombre,
        departamento_pec = EXCLUDED.departamento_pec,
        distrito_educativo = EXCLUDED.distrito_educativo,
        ue_cea_cee = EXCLUDED.ue_cea_cee,
        subsistema = EXCLUDED.subsistema,
        curso_area = EXCLUDED.curso_area,
        fecha_pec_inicio = EXCLUDED.fecha_pec_inicio,
        fecha_pec_fin = EXCLUDED.fecha_pec_fin,
        modalidad_graduacion = EXCLUDED.modalidad_graduacion,
        titulo_trabajo_grado = EXCLUDED.titulo_trabajo_grado,
        integrantes = EXCLUDED.integrantes,
        puntaje_final = EXCLUDED.puntaje_final,
        promedio_numeral = EXCLUDED.promedio_numeral,
        promedio_literal = EXCLUDED.promedio_literal,
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
      departamento_pec, distrito_educativo, ue_cea_cee, subsistema, curso_area,
      fInicio, fFin, modalidad_graduacion, titulo_trabajo_grado,
      JSON.stringify(integrantes), prom, promedio_literal,
      lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4), estado
    ];

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha C-2 de 5to Año guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha C-2 5to Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha C-2.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA C-2
export const deleteFichaC2_5toAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_c2_5to_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha C-2 eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Ficha C-2 5to Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha C-2.", error: error.message });
  }
};