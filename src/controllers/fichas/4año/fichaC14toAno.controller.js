import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA C-1
export const getFichaC1_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_c1_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha C-1 4to Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT)
export const saveOrUpdateFichaC1_4toAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      integrante_ectg = '',
      modalidad_graduacion = '',
      titulo_diseno_metodologico = '',
      c1 = 0, c2 = 0, c3 = 0, c4 = 0, c5 = 0,
      c6 = 0, c7 = 0, c8 = 0, c9 = 0, c10 = 0,
      puntaje_final = 0,
      puntaje_literal = 'CERO CON 00/100',
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

    const total = parseNum(puntaje_final);

    const checkRes = await client.query(
      `SELECT id FROM ficha_c1_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_c1_4to_ano_2026
        SET integrante_ectg = $1,
            modalidad_graduacion = $2,
            titulo_diseno_metodologico = $3,
            c1 = $4, c2 = $5, c3 = $6, c4 = $7, c5 = $8,
            c6 = $9, c7 = $10, c8 = $11, c9 = $12, c10 = $13,
            puntaje_final = $14,
            puntaje_literal = $15,
            lugar_ciudad = $16,
            departamento = $17,
            dia = $18,
            mes = $19,
            ano = $20,
            estado = $21,
            updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $22::uuid RETURNING *;
      `;
      values = [
        integrante_ectg, modalidad_graduacion, titulo_diseno_metodologico,
        parseNum(c1), parseNum(c2), parseNum(c3), parseNum(c4), parseNum(c5),
        parseNum(c6), parseNum(c7), parseNum(c8), parseNum(c9), parseNum(c10),
        total, puntaje_literal, lugar_ciudad, departamento, dia, mes,
        String(ano).slice(0, 4), estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_c1_4to_ano_2026 (
          estudiante_id, integrante_ectg, modalidad_graduacion, titulo_diseno_metodologico,
          c1, c2, c3, c4, c5, c6, c7, c8, c9, c10,
          puntaje_final, puntaje_literal, lugar_ciudad, departamento, dia, mes, ano, estado
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
        ) RETURNING *;
      `;
      values = [
        estudiante_id, integrante_ectg, modalidad_graduacion, titulo_diseno_metodologico,
        parseNum(c1), parseNum(c2), parseNum(c3), parseNum(c4), parseNum(c5),
        parseNum(c6), parseNum(c7), parseNum(c8), parseNum(c9), parseNum(c10),
        total, puntaje_literal, lugar_ciudad, departamento, dia, mes,
        String(ano).slice(0, 4), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha C-1 guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha C-1 4to Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha C-1.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA C-1
export const deleteFichaC1_4toAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_c1_4to_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha C-1 eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Ficha C-1 4to Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha C-1.", error: error.message });
  }
};