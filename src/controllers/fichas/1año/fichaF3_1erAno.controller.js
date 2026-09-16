import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA F-3 POR ESTUDIANTE
export const getFichaF3_1erAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM ficha_f3_1er_ano_2026 WHERE estudiante_id = $1 LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha F3 1er Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (SIN DOCENTE ACOMPAÑANTE)
export const saveOrUpdateFichaF3_1erAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      instrumentos_comunidad = null,
      instrumentos_ue = null,
      instrumentos_aula = null,
      promedio_numeral = 0,
      promedio_literal = 'CERO CON 00/100',
      observaciones = '',
      apellidos_nombres = '',
      esfm_ua = 'ESFM Simón Bolívar / UA El Alto',
      especialidad = '',
      lugar_ciudad = 'El Alto',
      departamento = 'La Paz',
      dia = String(new Date().getDate()),
      mes = 'SEPTIEMBRE',
      ano = '2026',
      estado = 'BORRADOR'
    } = datos;

    const valComunidad = (instrumentos_comunidad !== null && instrumentos_comunidad !== '') ? parseInt(instrumentos_comunidad, 10) : null;
    const valUe = (instrumentos_ue !== null && instrumentos_ue !== '') ? parseInt(instrumentos_ue, 10) : null;
    const valAula = (instrumentos_aula !== null && instrumentos_aula !== '') ? parseInt(instrumentos_aula, 10) : null;
    const promNum = parseFloat(promedio_numeral) || 0;

    const checkRes = await client.query(
      `SELECT id FROM ficha_f3_1er_ano_2026 WHERE estudiante_id = $1 LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_f3_1er_ano_2026
        SET instrumentos_comunidad = $1,
            instrumentos_ue = $2,
            instrumentos_aula = $3,
            promedio_numeral = $4,
            promedio_literal = $5,
            observaciones = $6,
            apellidos_nombres = $7,
            esfm_ua = $8,
            especialidad = $9,
            lugar_ciudad = $10,
            departamento = $11,
            dia = $12,
            mes = $13,
            ano = $14,
            estado = $15
        WHERE estudiante_id = $16 RETURNING *;
      `;
      values = [
        valComunidad, valUe, valAula, promNum, promedio_literal,
        observaciones, apellidos_nombres, esfm_ua, especialidad,
        lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4), estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_f3_1er_ano_2026 (
          estudiante_id, instrumentos_comunidad, instrumentos_ue, instrumentos_aula,
          promedio_numeral, promedio_literal, observaciones, apellidos_nombres,
          esfm_ua, especialidad, lugar_ciudad, departamento, dia, mes, ano, estado
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *;
      `;
      values = [
        estudiante_id, valComunidad, valUe, valAula, promNum, promedio_literal,
        observaciones, apellidos_nombres, esfm_ua, especialidad,
        lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha F-3 guardada correctamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha F3:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha F-3.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA F-3
export const deleteFichaF3_1erAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_f3_1er_ano_2026 WHERE estudiante_id = $1 RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha F-3 eliminada exitosamente." });
  } catch (error) {
    console.error("Error DELETE Ficha F3:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha F-3.", error: error.message });
  }
};