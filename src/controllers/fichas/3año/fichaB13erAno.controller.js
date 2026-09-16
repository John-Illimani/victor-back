import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA B-1
export const getFichaB1_3erAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_b1_3er_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha B-1 3er Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT)
export const saveOrUpdateFichaB1_3erAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      apellidos_nombres = '',
      esfm_ua = 'ESFM Simón Bolívar / UA El Alto',
      especialidad = '',
      c1 = 0,
      c2 = 0,
      c3 = 0,
      c4 = 0,
      c5 = 0,
      puntaje_final = 0,
      promedio_literal = 'CERO CON 00/100',
      recomendaciones = '',
      docente_acompanante_id = null,
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

    const nc1 = parseNum(c1);
    const nc2 = parseNum(c2);
    const nc3 = parseNum(c3);
    const nc4 = parseNum(c4);
    const nc5 = parseNum(c5);
    const pf = parseNum(puntaje_final);
    const docId = (docente_acompanante_id && String(docente_acompanante_id).trim() !== '') ? docente_acompanante_id : null;

    const checkRes = await client.query(
      `SELECT id FROM ficha_b1_3er_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_b1_3er_ano_2026
        SET apellidos_nombres = $1,
            esfm_ua = $2,
            especialidad = $3,
            c1 = $4,
            c2 = $5,
            c3 = $6,
            c4 = $7,
            c5 = $8,
            puntaje_final = $9,
            promedio_numeral = $9,
            promedio_literal = $10,
            recomendaciones = $11,
            docente_acompanante_id = $12::uuid,
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
        apellidos_nombres, esfm_ua, especialidad, nc1, nc2, nc3, nc4, nc5,
        pf, promedio_literal, recomendaciones, docId, lugar_ciudad, departamento,
        dia, mes, String(ano).slice(0, 4), estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_b1_3er_ano_2026 (
          estudiante_id, apellidos_nombres, esfm_ua, especialidad, c1, c2, c3, c4, c5,
          puntaje_final, promedio_numeral, promedio_literal, recomendaciones,
          docente_acompanante_id, lugar_ciudad, departamento, dia, mes, ano, estado
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10, $11, $12, $13::uuid, $14, $15, $16, $17, $18, $19
        ) RETURNING *;
      `;
      values = [
        estudiante_id, apellidos_nombres, esfm_ua, especialidad, nc1, nc2, nc3, nc4, nc5,
        pf, promedio_literal, recomendaciones, docId, lugar_ciudad, departamento,
        dia, mes, String(ano).slice(0, 4), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha B-1 guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha B-1 3er Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha B-1.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA B-1
export const deleteFichaB1_3erAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_b1_3er_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha B-1 eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Ficha B-1 3er Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha B-1.", error: error.message });
  }
};