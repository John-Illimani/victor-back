import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA B-4 POR ESTUDIANTE
export const getFichaB4_3erAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_b4_3er_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha B-4 3er Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT)
export const saveOrUpdateFichaB4_3erAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      apellidos_nombres = '',
      ser = 0,
      saber = 0,
      hacer = 0,
      decidir = 0,
      promedio_numeral = 0,
      promedio_literal = 'CERO',
      observaciones = '',
      docente_guia_id = null,
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

    const prom = parseNum(promedio_numeral);
    const docGuiaId = (docente_guia_id && String(docente_guia_id).trim() !== '') ? docente_guia_id : null;

    const checkRes = await client.query(
      `SELECT id FROM ficha_b4_3er_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_b4_3er_ano_2026
        SET apellidos_nombres = $1,
            ser = $2,
            saber = $3,
            hacer = $4,
            decidir = $5,
            promedio_numeral = $6,
            promedio_literal = $7,
            observaciones = $8,
            docente_guia_id = $9::uuid,
            lugar_ciudad = $10,
            departamento = $11,
            dia = $12,
            mes = $13,
            ano = $14,
            estado = $15,
            updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $16::uuid RETURNING *;
      `;
      values = [
        apellidos_nombres,
        parseNum(ser),
        parseNum(saber),
        parseNum(hacer),
        parseNum(decidir),
        prom,
        promedio_literal,
        observaciones,
        docGuiaId,
        lugar_ciudad,
        departamento,
        dia,
        mes,
        String(ano).slice(0, 4),
        estado,
        estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_b4_3er_ano_2026 (
          estudiante_id, apellidos_nombres,
          ser, saber, hacer, decidir,
          promedio_numeral, promedio_literal, observaciones,
          docente_guia_id, lugar_ciudad, departamento, dia, mes, ano, estado
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10::uuid, $11, $12, $13, $14, $15, $16
        ) RETURNING *;
      `;
      values = [
        estudiante_id,
        apellidos_nombres,
        parseNum(ser),
        parseNum(saber),
        parseNum(hacer),
        parseNum(decidir),
        prom,
        promedio_literal,
        observaciones,
        docGuiaId,
        lugar_ciudad,
        departamento,
        dia,
        mes,
        String(ano).slice(0, 4),
        estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha B-4 guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha B-4 3er Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha B-4.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR REGISTRO
export const deleteFichaB4_3erAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_b4_3er_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha B-4 eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Ficha B-4 3er Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha B-4.", error: error.message });
  }
};