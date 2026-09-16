import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA C-2
export const getFichaC2_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_c2_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha C-2 4to Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT)
export const saveOrUpdateFichaC2_4toAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      integrante_ectg = '',
      docente_tutor_id = null,
      modalidad_graduacion = '',
      titulo_diseno_metodologico = '',
      integrantes = [],
      puntaje_final = 0,
      promedio_literal = 'CERO CON 00/100',
      lugar_ciudad = 'El Alto',
      departamento = 'La Paz',
      dia = String(new Date().getDate()),
      mes = 'SEPTIEMBRE',
      ano = '2026',
      estado = 'GUARDADO'
    } = datos;

    const tutorId = (docente_tutor_id && String(docente_tutor_id).trim() !== '') ? docente_tutor_id : null;
    const numPuntajeFinal = isNaN(parseFloat(puntaje_final)) ? 0 : parseFloat(puntaje_final);

    const checkRes = await client.query(
      `SELECT id FROM ficha_c2_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_c2_4to_ano_2026
        SET integrante_ectg = $1,
            docente_tutor_id = $2::uuid,
            modalidad_graduacion = $3,
            titulo_diseno_metodologico = $4,
            integrantes = $5::jsonb,
            puntaje_final = $6,
            promedio_literal = $7,
            lugar_ciudad = $8,
            departamento = $9,
            dia = $10,
            mes = $11,
            ano = $12,
            estado = $13,
            updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $14::uuid RETURNING *;
      `;
      values = [
        integrante_ectg, tutorId, modalidad_graduacion,
        titulo_diseno_metodologico, JSON.stringify(integrantes),
        numPuntajeFinal, promedio_literal,
        lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4),
        estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_c2_4to_ano_2026 (
          estudiante_id, integrante_ectg, docente_tutor_id, modalidad_graduacion,
          titulo_diseno_metodologico, integrantes, puntaje_final, promedio_literal,
          lugar_ciudad, departamento, dia, mes, ano, estado
        ) VALUES (
          $1::uuid, $2, $3::uuid, $4, $5, $6::jsonb, $7, $8, $9, $10, $11, $12, $13, $14
        ) RETURNING *;
      `;
      values = [
        estudiante_id, integrante_ectg, tutorId, modalidad_graduacion,
        titulo_diseno_metodologico, JSON.stringify(integrantes),
        numPuntajeFinal, promedio_literal,
        lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha C-2 guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha C-2 4to Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha C-2.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA C-2
export const deleteFichaC2_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_c2_4to_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha C-2 eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Ficha C-2 4to Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha C-2.", error: error.message });
  }
};