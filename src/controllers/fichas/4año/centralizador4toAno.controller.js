import { pool } from "../../../database/database.js";

// GET - OBTENER CENTRALIZADOR
export const getCentralizador_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM centralizador_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Centralizador 4to Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT)
export const saveOrUpdateCentralizador_4toAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      docente_tutor_id = null,
      integrante_ectg = '',
      especialidad = '',
      nota_a1 = 0, nota_a2 = 0, nota_b1 = 0, nota_b4 = 0, nota_b5 = 0,
      nota_b6 = 0, nota_b7 = 0, nota_c1 = 0, nota_c2 = 0,
      promedio_numeral = 0,
      promedio_literal = 'CERO CON 00/100',
      lugar_ciudad = 'El Alto',
      departamento = 'La Paz',
      dia = String(new Date().getDate()),
      mes = 'SEPTIEMBRE',
      ano = '2026',
      estado = 'GUARDADO'
    } = datos;

    const tutorId = (docente_tutor_id && String(docente_tutor_id).trim() !== '') ? docente_tutor_id : null;
    const parseNum = (val) => { const n = parseFloat(val); return isNaN(n) ? 0 : n; };

    const checkRes = await client.query(
      `SELECT id FROM centralizador_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE centralizador_4to_ano_2026
        SET docente_tutor_id = $1::uuid,
            integrante_ectg = $2,
            especialidad = $3,
            nota_a1 = $4, nota_a2 = $5, nota_b1 = $6, nota_b4 = $7, nota_b5 = $8,
            nota_b6 = $9, nota_b7 = $10, nota_c1 = $11, nota_c2 = $12,
            promedio_numeral = $13,
            promedio_literal = $14,
            lugar_ciudad = $15,
            departamento = $16,
            dia = $17,
            mes = $18,
            ano = $19,
            estado = $20,
            updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $21::uuid RETURNING *;
      `;
      values = [
        tutorId, integrante_ectg, especialidad,
        parseNum(nota_a1), parseNum(nota_a2), parseNum(nota_b1), parseNum(nota_b4), parseNum(nota_b5),
        parseNum(nota_b6), parseNum(nota_b7), parseNum(nota_c1), parseNum(nota_c2),
        parseNum(promedio_numeral), promedio_literal, lugar_ciudad, departamento,
        dia, mes, String(ano).slice(0, 4), estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO centralizador_4to_ano_2026 (
          estudiante_id, docente_tutor_id, integrante_ectg, especialidad,
          nota_a1, nota_a2, nota_b1, nota_b4, nota_b5, nota_b6, nota_b7, nota_c1, nota_c2,
          promedio_numeral, promedio_literal, lugar_ciudad, departamento, dia, mes, ano, estado
        ) VALUES (
          $1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
        ) RETURNING *;
      `;
      values = [
        estudiante_id, tutorId, integrante_ectg, especialidad,
        parseNum(nota_a1), parseNum(nota_a2), parseNum(nota_b1), parseNum(nota_b4), parseNum(nota_b5),
        parseNum(nota_b6), parseNum(nota_b7), parseNum(nota_c1), parseNum(nota_c2),
        parseNum(promedio_numeral), promedio_literal, lugar_ciudad, departamento,
        dia, mes, String(ano).slice(0, 4), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Centralizador guardado exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Centralizador 4to Año:", error);
    return res.status(500).json({ message: "Error interno al guardar el Centralizador.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR CENTRALIZADOR
export const deleteCentralizador_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM centralizador_4to_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Centralizador eliminado correctamente." });
  } catch (error) {
    console.error("Error DELETE Centralizador 4to Año:", error);
    return res.status(500).json({ message: "Error al eliminar el Centralizador.", error: error.message });
  }
};