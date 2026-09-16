import { pool } from "../../../database/database.js";

// GET - OBTENER CENTRALIZADOR DE 5TO AÑO
export const getCentralizador5toAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM centralizador_5to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Centralizador 5to Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE MANUAL
export const saveOrUpdateCentralizador5toAno = async (req, res) => {
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
      especialidad = '',
      nota_a1 = 0, nota_b1 = 0, nota_b4 = 0, nota_b5 = 0, nota_b6 = 0, nota_c1 = 0, nota_c2 = 0,
      promedio_final_1 = 0, promedio_final_2 = 0, promedio_numeral = 0,
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

    const query = `
      INSERT INTO centralizador_5to_ano_2026 (
        estudiante_id, docente_tutor_id, estudiante_nombre, especialidad,
        nota_a1, nota_b1, nota_b4, nota_b5, nota_b6, nota_c1, nota_c2,
        promedio_final_1, promedio_final_2, promedio_numeral, promedio_literal,
        lugar_ciudad, departamento, dia, mes, ano, estado
      ) VALUES (
        $1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      )
      ON CONFLICT (estudiante_id) DO UPDATE SET
        docente_tutor_id = EXCLUDED.docente_tutor_id,
        estudiante_nombre = EXCLUDED.estudiante_nombre,
        especialidad = EXCLUDED.especialidad,
        nota_a1 = EXCLUDED.nota_a1,
        nota_b1 = EXCLUDED.nota_b1,
        nota_b4 = EXCLUDED.nota_b4,
        nota_b5 = EXCLUDED.nota_b5,
        nota_b6 = EXCLUDED.nota_b6,
        nota_c1 = EXCLUDED.nota_c1,
        nota_c2 = EXCLUDED.nota_c2,
        promedio_final_1 = EXCLUDED.promedio_final_1,
        promedio_final_2 = EXCLUDED.promedio_final_2,
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
      estudiante_id, tutorId, estudiante_nombre, especialidad,
      parseNum(nota_a1), parseNum(nota_b1), parseNum(nota_b4), parseNum(nota_b5), parseNum(nota_b6), parseNum(nota_c1), parseNum(nota_c2),
      parseNum(promedio_final_1), parseNum(promedio_final_2), parseNum(promedio_numeral), promedio_literal,
      lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4), estado
    ];

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Centralizador de 5to Año guardado exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Centralizador 5to Año:", error);
    return res.status(500).json({ message: "Error interno al guardar el Centralizador.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR CENTRALIZADOR
export const deleteCentralizador5toAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM centralizador_5to_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Centralizador de 5to Año eliminado correctamente." });
  } catch (error) {
    console.error("Error DELETE Centralizador 5to Año:", error);
    return res.status(500).json({ message: "Error al eliminar el Centralizador.", error: error.message });
  }
};