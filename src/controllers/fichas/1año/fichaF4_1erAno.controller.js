import { pool } from "../../../database/database.js";

// GET - OBTENER FICHA F-4 POR ESTUDIANTE (UUID)
export const getFichaF4_1erAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM ficha_f4_1er_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }
    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Ficha F4 1er Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - SAVE OR UPDATE (UPSERT CON SOPORTE UUID)
export const saveOrUpdateFichaF4_1erAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      dimension_ser = 0,
      dimension_saber = 0,
      dimension_hacer = 0,
      dimension_decidir = 0,
      promedio_numeral = 0,
      promedio_literal = 'CERO CON 00/100',
      observaciones = '',
      docente_guia_id = null,
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

    const dimSer = Math.min(100, Math.max(0, parseFloat(dimension_ser) || 0));
    const dimSaber = Math.min(100, Math.max(0, parseFloat(dimension_saber) || 0));
    const dimHacer = Math.min(100, Math.max(0, parseFloat(dimension_hacer) || 0));
    const dimDecidir = Math.min(100, Math.max(0, parseFloat(dimension_decidir) || 0));
    const promNum = Math.min(100, Math.max(0, parseFloat(promedio_numeral) || 0));
    
    // Normalización de UUID para docente guía
    const docGuiaId = (docente_guia_id && String(docente_guia_id).trim() !== '') ? docente_guia_id : null;

    const checkRes = await client.query(
      `SELECT id FROM ficha_f4_1er_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let query = '';
    let values = [];

    if (checkRes.rowCount > 0) {
      query = `
        UPDATE ficha_f4_1er_ano_2026
        SET dimension_ser = $1,
            dimension_saber = $2,
            dimension_hacer = $3,
            dimension_decidir = $4,
            promedio_numeral = $5,
            promedio_literal = $6,
            observaciones = $7,
            docente_guia_id = $8::uuid,
            apellidos_nombres = $9,
            esfm_ua = $10,
            especialidad = $11,
            lugar_ciudad = $12,
            departamento = $13,
            dia = $14,
            mes = $15,
            ano = $16,
            estado = $17,
            updated_at = CURRENT_TIMESTAMP
        WHERE estudiante_id = $18::uuid RETURNING *;
      `;
      values = [
        dimSer, dimSaber, dimHacer, dimDecidir, promNum, promedio_literal,
        observaciones, docGuiaId, apellidos_nombres, esfm_ua, especialidad,
        lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4),
        estado, estudiante_id
      ];
    } else {
      query = `
        INSERT INTO ficha_f4_1er_ano_2026 (
          estudiante_id, dimension_ser, dimension_saber, dimension_hacer, dimension_decidir,
          promedio_numeral, promedio_literal, observaciones, docente_guia_id, apellidos_nombres,
          esfm_ua, especialidad, lugar_ciudad, departamento, dia, mes, ano, estado
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9::uuid, $10,
          $11, $12, $13, $14, $15, $16, $17, $18
        ) RETURNING *;
      `;
      values = [
        estudiante_id, dimSer, dimSaber, dimHacer, dimDecidir,
        promNum, promedio_literal, observaciones, docGuiaId, apellidos_nombres,
        esfm_ua, especialidad, lugar_ciudad, departamento, dia, mes,
        String(ano).slice(0, 4), estado
      ];
    }

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Ficha F-4 guardada correctamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Ficha F4:", error);
    return res.status(500).json({ message: "Error interno al guardar la Ficha F-4.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR FICHA F-4
export const deleteFichaF4_1erAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ficha_f4_1er_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Ficha F-4 eliminada exitosamente." });
  } catch (error) {
    console.error("Error DELETE Ficha F4:", error);
    return res.status(500).json({ message: "Error al eliminar la Ficha F-4.", error: error.message });
  }
};