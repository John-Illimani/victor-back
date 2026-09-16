import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA A-1 5TO AÑO
export const getFichaA1_5toAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_a1_5to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha A-1 5to Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT OPTIMIZADO)
export const saveOrUpdateFichaA1_5toAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      apellidos_nombres = '',
      observacion_c1 = '',
      observacion_c2 = '',
      observacion_c3 = '',
      nota_c1 = 0,
      nota_c2 = 0,
      nota_c3 = 0,
      promedio_numeral = 0,
      promedio_literal = 'CERO CON 00/100',
      observaciones_generales = '',
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

    const c1 = parseNum(nota_c1);
    const c2 = parseNum(nota_c2);
    const c3 = parseNum(nota_c3);
    const prom = parseNum(promedio_numeral);

    const query = `
      INSERT INTO ficha_a1_5to_ano_2026 (
        estudiante_id, apellidos_nombres, observacion_c1, observacion_c2, observacion_c3,
        nota_c1, nota_c2, nota_c3, puntaje_final, promedio_numeral, promedio_literal,
        observaciones_generales, lugar_ciudad, departamento, dia, mes, ano, estado
      ) VALUES (
        $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $9, $10, $11, $12, $13, $14, $15, $16, $17
      )
      ON CONFLICT (estudiante_id) DO UPDATE SET
        apellidos_nombres = EXCLUDED.apellidos_nombres,
        observacion_c1 = EXCLUDED.observacion_c1,
        observacion_c2 = EXCLUDED.observacion_c2,
        observacion_c3 = EXCLUDED.observacion_c3,
        nota_c1 = EXCLUDED.nota_c1,
        nota_c2 = EXCLUDED.nota_c2,
        nota_c3 = EXCLUDED.nota_c3,
        puntaje_final = EXCLUDED.puntaje_final,
        promedio_numeral = EXCLUDED.promedio_numeral,
        promedio_literal = EXCLUDED.promedio_literal,
        observaciones_generales = EXCLUDED.observaciones_generales,
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
      estudiante_id, apellidos_nombres, observacion_c1, observacion_c2, observacion_c3,
      c1, c2, c3, prom, promedio_literal, observaciones_generales,
      lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4), estado
    ];

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha A-1 de 5to Año guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha A-1 5to Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha A-1.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA A-1
export const deleteFichaA1_5toAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_a1_5to_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha A-1 eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Ficha A-1 5to Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha A-1.", error: error.message });
  }
};