import { pool } from "../../../database/database.js";

// GET - OBTENER ACTA DE POSTERGACIÓN
export const getActaPostergacion_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM acta_postergacion_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Acta Postergación 4to Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT)
export const saveOrUpdateActaPostergacion_4toAno = async (req, res) => {
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
      titulo_diseno = '',
      estudiantes_ectg = [],
      lugar_ciudad = 'El Alto',
      hora_presentacion = '08:00',
      dia_post = String(new Date().getDate()),
      mes_post = 'SEPTIEMBRE',
      ano_post = '2026',
      ambientes = 'Instalaciones de la ESFM/UA',
      motivos_postergacion = '',
      estudiantes_posterga = '',
      nueva_fecha_dia = '',
      nueva_fecha_mes = 'SEPTIEMBRE',
      nueva_fecha_ano = '2026',
      departamento = 'La Paz',
      dia = String(new Date().getDate()),
      mes = 'SEPTIEMBRE',
      ano = '2026',
      estado = 'GUARDADO'
    } = datos;

    const tutorId = (docente_tutor_id && String(docente_tutor_id).trim() !== '') ? docente_tutor_id : null;

    const checkRes = await client.query(
      `SELECT id FROM acta_postergacion_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE acta_postergacion_4to_ano_2026
        SET docente_tutor_id = $1::uuid,
            modalidad_graduacion = $2,
            titulo_diseno = $3,
            estudiantes_ectg = $4::jsonb,
            lugar_ciudad = $5,
            hora_presentacion = $6,
            dia_post = $7,
            mes_post = $8,
            ano_post = $9,
            ambientes = $10,
            motivos_postergacion = $11,
            estudiantes_posterga = $12,
            nueva_fecha_dia = $13,
            nueva_fecha_mes = $14,
            nueva_fecha_ano = $15,
            departamento = $16,
            dia = $17,
            mes = $18,
            ano = $19,
            estado = $20,
            updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $21::uuid RETURNING *;
      `;
      values = [
        tutorId, modalidad_graduacion, titulo_diseno, JSON.stringify(estudiantes_ectg),
        lugar_ciudad, hora_presentacion, dia_post, mes_post, String(ano_post).slice(0, 4),
        ambientes, motivos_postergacion, estudiantes_posterga,
        nueva_fecha_dia, nueva_fecha_mes, String(nueva_fecha_ano).slice(0, 4),
        departamento, dia, mes, String(ano).slice(0, 4), estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO acta_postergacion_4to_ano_2026 (
          estudiante_id, docente_tutor_id, modalidad_graduacion, titulo_diseno,
          estudiantes_ectg, lugar_ciudad, hora_presentacion, dia_post, mes_post, ano_post,
          ambientes, motivos_postergacion, estudiantes_posterga, nueva_fecha_dia,
          nueva_fecha_mes, nueva_fecha_ano, departamento, dia, mes, ano, estado
        ) VALUES (
          $1::uuid, $2::uuid, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
        ) RETURNING *;
      `;
      values = [
        estudiante_id, tutorId, modalidad_graduacion, titulo_diseno,
        JSON.stringify(estudiantes_ectg), lugar_ciudad, hora_presentacion, dia_post, mes_post, String(ano_post).slice(0, 4),
        ambientes, motivos_postergacion, estudiantes_posterga, nueva_fecha_dia,
        nueva_fecha_mes, String(nueva_fecha_ano).slice(0, 4), departamento, dia, mes, String(ano).slice(0, 4), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Acta de Postergación guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Acta Postergación 4to Año:", error);
    return res.status(500).json({ message: "Error interno al guardar el Acta de Postergación.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR ACTA DE POSTERGACIÓN
export const deleteActaPostergacion_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM acta_postergacion_4to_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Acta de Postergación eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Acta Postergación 4to Año:", error);
    return res.status(500).json({ message: "Error al eliminar el Acta de Postergación.", error: error.message });
  }
};