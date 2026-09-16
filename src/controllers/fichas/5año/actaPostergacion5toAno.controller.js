import { pool } from "../../../database/database.js";

// GET - OBTENER ACTA DE POSTERGACIÓN 5TO AÑO
export const getActaPostergacion_5toAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM acta_postergacion_5to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Acta Postergación 5to Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT OPTIMIZADO)
export const saveOrUpdateActaPostergacion_5toAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      docente_tutor_id = null,
      modalidad_graduacion = '',
      titulo_trabajo_grado = '',
      estudiantes_ectg = [],
      ambientes = 'Instalaciones de la ESFM/UA',
      dia_post = String(new Date().getDate()),
      mes_post = 'SEPTIEMBRE',
      ano_post = '2026',
      titulo_trabajo_titulado = '',
      motivos_postergacion = '',
      estudiantes_posterga = '',
      nueva_fecha_dia = '',
      nueva_fecha_mes = 'SEPTIEMBRE',
      nueva_fecha_ano = '2026',
      lugar_ciudad = 'El Alto',
      departamento = 'La Paz',
      dia = String(new Date().getDate()),
      mes = 'SEPTIEMBRE',
      ano = '2026',
      estado = 'GUARDADO'
    } = datos;

    const tutorId = (docente_tutor_id && String(docente_tutor_id).trim() !== '') ? docente_tutor_id : null;

    const query = `
      INSERT INTO acta_postergacion_5to_ano_2026 (
        estudiante_id, docente_tutor_id, modalidad_graduacion, titulo_trabajo_grado,
        estudiantes_ectg, ambientes, dia_post, mes_post, ano_post,
        titulo_trabajo_titulado, motivos_postergacion, estudiantes_posterga,
        nueva_fecha_dia, nueva_fecha_mes, nueva_fecha_ano,
        lugar_ciudad, departamento, dia, mes, ano, estado
      ) VALUES (
        $1::uuid, $2::uuid, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      )
      ON CONFLICT (estudiante_id) DO UPDATE SET
        docente_tutor_id = EXCLUDED.docente_tutor_id,
        modalidad_graduacion = EXCLUDED.modalidad_graduacion,
        titulo_trabajo_grado = EXCLUDED.titulo_trabajo_grado,
        estudiantes_ectg = EXCLUDED.estudiantes_ectg,
        ambientes = EXCLUDED.ambientes,
        dia_post = EXCLUDED.dia_post,
        mes_post = EXCLUDED.mes_post,
        ano_post = EXCLUDED.ano_post,
        titulo_trabajo_titulado = EXCLUDED.titulo_trabajo_titulado,
        motivos_postergacion = EXCLUDED.motivos_postergacion,
        estudiantes_posterga = EXCLUDED.estudiantes_posterga,
        nueva_fecha_dia = EXCLUDED.nueva_fecha_dia,
        nueva_fecha_mes = EXCLUDED.nueva_fecha_mes,
        nueva_fecha_ano = EXCLUDED.nueva_fecha_ano,
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
      estudiante_id, tutorId, modalidad_graduacion, titulo_trabajo_grado,
      JSON.stringify(estudiantes_ectg), ambientes, dia_post, mes_post, String(ano_post).slice(0, 4),
      titulo_trabajo_titulado, motivos_postergacion, estudiantes_posterga,
      nueva_fecha_dia, nueva_fecha_mes, String(nueva_fecha_ano).slice(0, 4),
      lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4), estado
    ];

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Acta de Postergación guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Acta Postergación 5to Año:", error);
    return res.status(500).json({ message: "Error interno al guardar el Acta de Postergación.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR ACTA DE POSTERGACIÓN
export const deleteActaPostergacion_5toAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM acta_postergacion_5to_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Acta de Postergación eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Acta Postergación 5to Año:", error);
    return res.status(500).json({ message: "Error al eliminar el Acta de Postergación.", error: error.message });
  }
};