import { pool } from "../../../database/database.js";

// GET - OBTENER CENTRALIZADOR DE UN ESTUDIANTE (2DO AÑO)
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
      return res.status(200).json({
        existe: false,
        datos: {
          nota_f1: 0,
          nota_f2: 0,
          nota_f3: 0,
          nota_f4: 0,
          nota_f5: 0,
          nota_f6: 0,
          promedio_numeral: 0,
          observaciones: '',
          lugar_ciudad: 'El Alto',
          departamento: 'La Paz',
          dia: String(new Date().getDate()),
          mes: 'SEPTIEMBRE',
          ano: '2026'
        }
      });
    }

    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error("Error GET Centralizador 2do Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - GUARDAR OBSERVACIONES Y DATOS DE FECHA EN EL CENTRALIZADOR
export const saveCentralizadorDetalles_2doAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  try {
    const {
      observaciones = '',
      lugar_ciudad = 'El Alto',
      departamento = 'La Paz',
      dia = String(new Date().getDate()),
      mes = 'SEPTIEMBRE',
      ano = '2026'
    } = datos;

    const result = await pool.query(
      `INSERT INTO centralizador_2do_ano_2026 (
        estudiante_id, observaciones, lugar_ciudad, departamento, dia, mes, ano, updated_at
      ) VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      ON CONFLICT (estudiante_id) DO UPDATE SET
        observaciones = EXCLUDED.observaciones,
        lugar_ciudad = EXCLUDED.lugar_ciudad,
        departamento = EXCLUDED.departamento,
        dia = EXCLUDED.dia,
        mes = EXCLUDED.mes,
        ano = EXCLUDED.ano,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;`,
      [estudiante_id, observaciones, lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4)]
    );

    return res.status(200).json({ message: "Detalles del centralizador guardados correctamente.", datos: result.rows[0] });
  } catch (error) {
    console.error("Error SAVE Detalles Centralizador 2do Año:", error);
    return res.status(500).json({ message: "Error al guardar los datos del centralizador.", error: error.message });
  }
};