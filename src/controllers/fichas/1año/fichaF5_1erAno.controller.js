import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA F-5 POR ESTUDIANTE
export const getFichaF5_1erAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_f5_1er_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha F5 1er Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT CON SOPORTE UUID)
export const saveOrUpdateFichaF5_1erAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      coherencia_contenido = 0,
      descripcion_comunidad = 0,
      ambitos_estructura = 0,
      desarrollo_procesos = 0,
      redaccion_ortografia = 0,
      promedio_numeral = 0,
      promedio_literal = 'CERO CON 00/100',
      observaciones = '',
      docente_acompanante_id = null,
      apellidos_nombres = '',
      esfm_ua = 'ESFM Simón Bolívar / UA El Alto',
      especialidad = '',
      lugar_ciudad = 'El Alto',
      departamento = 'La Paz',
      dia = String(new Date().getDate()),
      mes = 'SEPTIEMBRE',
      ano = '2026',
      estado = 'BORRADOR'
    } = datos;

    // Clampeo y limpieza de valores entre 0 y 100
    const cContenido = Math.min(100, Math.max(0, parseFloat(coherencia_contenido) || 0));
    const dComunidad = Math.min(100, Math.max(0, parseFloat(descripcion_comunidad) || 0));
    const aEstructura = Math.min(100, Math.max(0, parseFloat(ambitos_estructura) || 0));
    const dProcesos = Math.min(100, Math.max(0, parseFloat(desarrollo_procesos) || 0));
    const rOrtografia = Math.min(100, Math.max(0, parseFloat(redaccion_ortografia) || 0));
    const promNum = Math.min(100, Math.max(0, parseFloat(promedio_numeral) || 0));

    // Normalización de UUID de docente acompañante
    const docAcompId = (docente_acompanante_id && String(docente_acompanante_id).trim() !== '') ? docente_acompanante_id : null;

    const checkRes = await client.query(
      `SELECT id FROM ficha_f5_1er_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_f5_1er_ano_2026
        SET coherencia_contenido = $1,
            descripcion_comunidad = $2,
            ambitos_estructura = $3,
            desarrollo_procesos = $4,
            redaccion_ortografia = $5,
            promedio_numeral = $6,
            promedio_literal = $7,
            observaciones = $8,
            docente_acompanante_id = $9::uuid,
            apellidos_nombres = $10,
            esfm_ua = $11,
            especialidad = $12,
            lugar_ciudad = $13,
            departamento = $14,
            dia = $15,
            mes = $16,
            ano = $17,
            estado = $18,
            updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $19::uuid RETURNING *;
      `;
      values = [
        cContenido, dComunidad, aEstructura, dProcesos, rOrtografia,
        promNum, promedio_literal, observaciones, docAcompId, apellidos_nombres,
        esfm_ua, especialidad, lugar_ciudad, departamento, dia, mes,
        String(ano).slice(0, 4), estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_f5_1er_ano_2026 (
          estudiante_id, coherencia_contenido, descripcion_comunidad, ambitos_estructura,
          desarrollo_procesos, redaccion_ortografia, promedio_numeral, promedio_literal,
          observaciones, docente_acompanante_id, apellidos_nombres, esfm_ua, especialidad,
          lugar_ciudad, departamento, dia, mes, ano, estado
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10::uuid,
          $11, $12, $13, $14, $15, $16, $17, $18, $19
        ) RETURNING *;
      `;
      values = [
        estudiante_id, cContenido, dComunidad, aEstructura, dProcesos,
        rOrtografia, promNum, promedio_literal, observaciones, docAcompId,
        apellidos_nombres, esfm_ua, especialidad, lugar_ciudad, departamento,
        dia, mes, String(ano).slice(0, 4), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha F-5 guardada correctamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha F5:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha F-5.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA F-5
export const deleteFichaF5_1erAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_f5_1er_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha F-5 eliminada exitosamente." });
  } catch (error) {
    console.error("Error DELETE Ficha F5:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha F-5.", error: error.message });
  }
};