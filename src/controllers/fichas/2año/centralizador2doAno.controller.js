import { pool } from "../../../database/database.js";

// 1. GET - CONSULTAR CENTRALIZADOR
export const getCentralizador_2doAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM centralizador_2do_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: null });
    }

    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Centralizador 2do Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// 2. POST / PUT - GUARDAR O ACTUALIZAR CENTRALIZADOR
export const saveCentralizadorDetalles_2doAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  try {
    const {
      apellidos_nombres = '',
      esfm_ua = 'ESFM/UA - El Alto',
      ano_formacion = '2do Año de Formación',
      nota_f1 = 0, nota_f2 = 0, nota_f3 = 0,
      nota_f4 = 0, nota_f5 = 0, nota_f6 = 0,
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
      INSERT INTO centralizador_2do_ano_2026 (
        estudiante_id, apellidos_nombres, esfm_ua, ano_formacion,
        nota_f1, nota_f2, nota_f3, nota_f4, nota_f5, nota_f6,
        promedio_numeral, promedio_literal, observaciones,
        lugar_ciudad, departamento, dia, mes, ano, updated_at
      ) VALUES (
        $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, CURRENT_TIMESTAMP
      )
      ON CONFLICT (estudiante_id) DO UPDATE SET
        apellidos_nombres = EXCLUDED.apellidos_nombres,
        esfm_ua = EXCLUDED.esfm_ua,
        ano_formacion = EXCLUDED.ano_formacion,
        nota_f1 = EXCLUDED.nota_f1,
        nota_f2 = EXCLUDED.nota_f2,
        nota_f3 = EXCLUDED.nota_f3,
        nota_f4 = EXCLUDED.nota_f4,
        nota_f5 = EXCLUDED.nota_f5,
        nota_f6 = EXCLUDED.nota_f6,
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
      estudiante_id, apellidos_nombres, esfm_ua, ano_formacion,
      parseNum(nota_f1), parseNum(nota_f2), parseNum(nota_f3),
      parseNum(nota_f4), parseNum(nota_f5), parseNum(nota_f6),
      parseNum(promedio_numeral), promedio_literal, observaciones,
      lugar_ciudad, departamento, String(dia), mes, String(ano).slice(0, 4)
    ];

    const result = await pool.query(query, values);

    return res.status(200).json({
      message: "Centralizador guardado correctamente.",
      datos: result.rows[0]
    });
  } catch (error) {
    console.error("Error SAVE Centralizador 2do Año:", error);
    return res.status(500).json({ message: "Error interno al guardar los datos.", error: error.message });
  }
};

// 3. DELETE - ELIMINAR CENTRALIZADOR
export const deleteCentralizador_2doAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `DELETE FROM centralizador_2do_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }

    return res.status(200).json({ message: "Centralizador eliminado correctamente." });
  } catch (error) {
    console.error("Error DELETE Centralizador 2do Año:", error);
    return res.status(500).json({ message: "Error al eliminar el registro.", error: error.message });
  }
};