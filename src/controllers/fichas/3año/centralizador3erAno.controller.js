import { pool } from "../../../database/database.js";

// GET - CONSULTAR CENTRALIZADOR
export const getCentralizador_3erAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM centralizador_3er_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Centralizador 3er Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - GUARDAR O ACTUALIZAR
export const saveOrUpdateCentralizador_3erAno = async (req, res) => {
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
      nota_a1 = 0, nota_b1 = 0, nota_b2 = 0,
      nota_b3 = 0, nota_b4 = 0, nota_b5 = 0,
      promedio_numeral = 0,
      promedio_literal = 'CERO CON 00/100',
      observaciones = '',
      lugar_ciudad = 'El Alto',
      departamento = 'La Paz',
      dia = String(new Date().getDate()),
      mes = 'SEPTIEMBRE',
      ano = '2026'
    } = datos;

    const parseNum = (val) => {
      const num = parseFloat(val);
      return isNaN(num) ? 0 : num;
    };

    const query = `
      INSERT INTO centralizador_3er_ano_2026 (
        estudiante_id, apellidos_nombres, esfm_ua, especialidad,
        nota_a1, nota_b1, nota_b2, nota_b3, nota_b4, nota_b5,
        promedio_numeral, promedio_literal, observaciones,
        lugar_ciudad, departamento, dia, mes, ano, updated_at
      ) VALUES (
        $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, CURRENT_TIMESTAMP
      )
      ON CONFLICT (estudiante_id) DO UPDATE SET
        apellidos_nombres = EXCLUDED.apellidos_nombres,
        esfm_ua = EXCLUDED.esfm_ua,
        especialidad = EXCLUDED.especialidad,
        nota_a1 = EXCLUDED.nota_a1,
        nota_b1 = EXCLUDED.nota_b1,
        nota_b2 = EXCLUDED.nota_b2,
        nota_b3 = EXCLUDED.nota_b3,
        nota_b4 = EXCLUDED.nota_b4,
        nota_b5 = EXCLUDED.nota_b5,
        promedio_numeral = EXCLUDED.promedio_numeral,
        promedio_literal = EXCLUDED.promedio_literal,
        observaciones = EXCLUDED.observaciones,
        lugar_ciudad = EXCLUDED.lugar_ciudad,
        departamento = EXCLUDED.departamento,
        dia = EXCLUDED.dia,
        mes = EXCLUDED.mes,
        ano = EXCLUDED.ano,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const values = [
      estudiante_id, apellidos_nombres, esfm_ua, especialidad,
      parseNum(nota_a1), parseNum(nota_b1), parseNum(nota_b2),
      parseNum(nota_b3), parseNum(nota_b4), parseNum(nota_b5),
      parseNum(promedio_numeral), promedio_literal, observaciones,
      lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4)
    ];

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Centralizador de Evaluación guardado correctamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Centralizador 3er Año:", error);
    return res.status(500).json({ message: "Error interno al guardar el Centralizador.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR
export const deleteCentralizador_3erAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM centralizador_3er_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Centralizador eliminado correctamente." });
  } catch (error) {
    console.error("Error DELETE Centralizador 3er Año:", error);
    return res.status(500).json({ message: "Error al eliminar el Centralizador.", error: error.message });
  }
};