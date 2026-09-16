import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA B-5 5TO AÑO
export const getFichaB5_5toAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_b5_5to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha B-5 5to Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT OPTIMIZADO PARA ALTO TRÁFICO)
export const saveOrUpdateFichaB5_5toAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      docente_guia_id = null,
      apellidos_nombres = '',
      nota_ser = 0,
      nota_saber = 0,
      nota_hacer = 0,
      nota_decidir = 0,
      obs_ser = '',
      obs_saber = '',
      obs_hacer = '',
      obs_decidir = '',
      promedio_numeral = 0,
      promedio_literal = 'CERO CON 00/100',
      observaciones_sugerencias = '',
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

    const guiaId = (docente_guia_id && String(docente_guia_id).trim() !== '') ? docente_guia_id : null;
    const prom = parseNum(promedio_numeral);

    const query = `
      INSERT INTO ficha_b5_5to_ano_2026 (
        estudiante_id, docente_guia_id, apellidos_nombres,
        nota_ser, nota_saber, nota_hacer, nota_decidir,
        obs_ser, obs_saber, obs_hacer, obs_decidir,
        puntaje_final, promedio_numeral, promedio_literal, observaciones_sugerencias,
        lugar_ciudad, departamento, dia, mes, ano, estado
      ) VALUES (
        $1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $12, $13, $14, $15, $16, $17, $18, $19, $20
      )
      ON CONFLICT (estudiante_id) DO UPDATE SET
        docente_guia_id = EXCLUDED.docente_guia_id,
        apellidos_nombres = EXCLUDED.apellidos_nombres,
        nota_ser = EXCLUDED.nota_ser,
        nota_saber = EXCLUDED.nota_saber,
        nota_hacer = EXCLUDED.nota_hacer,
        nota_decidir = EXCLUDED.nota_decidir,
        obs_ser = EXCLUDED.obs_ser,
        obs_saber = EXCLUDED.obs_saber,
        obs_hacer = EXCLUDED.obs_hacer,
        obs_decidir = EXCLUDED.obs_decidir,
        puntaje_final = EXCLUDED.puntaje_final,
        promedio_numeral = EXCLUDED.promedio_numeral,
        promedio_literal = EXCLUDED.promedio_literal,
        observaciones_sugerencias = EXCLUDED.observaciones_sugerencias,
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
      estudiante_id, guiaId, apellidos_nombres,
      parseNum(nota_ser), parseNum(nota_saber), parseNum(nota_hacer), parseNum(nota_decidir),
      obs_ser, obs_saber, obs_hacer, obs_decidir,
      prom, promedio_literal, observaciones_sugerencias,
      lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4), estado
    ];

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha B-5 de 5to Año guardada exitosamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha B-5 5to Año:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha B-5.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA B-5
export const deleteFichaB5_5toAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_b5_5to_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha B-5 eliminada correctamente." });
  } catch (error) {
    console.error("Error DELETE Ficha B-5 5to Año:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha B-5.", error: error.message });
  }
};