import { pool } from "../../../database/database.js";

// GET - OBTENER CENTRALIZADOR DE UN ESTUDIANTE
export const getCentralizador_1erAno = async (req, res) => {
  const { estudiante_id } = req.params;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM centralizador_1er_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
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
          promedio_numeral: 0,
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
    console.error("Error GET Centralizador 1er Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - GUARDAR O ACTUALIZAR ÚNICAMENTE LUGAR Y FECHA DE CENTRALIZACIÓN
export const updateFechaCentralizador_1erAno = async (req, res) => {
  const { estudiante_id, datos } = req.body;

  if (!estudiante_id || !datos) {
    return res.status(400).json({ message: "Se requiere estudiante_id y datos válidos." });
  }

  try {
    const {
      lugar_ciudad = 'El Alto',
      departamento = 'La Paz',
      dia = String(new Date().getDate()),
      mes = 'SEPTIEMBRE',
      ano = '2026'
    } = datos;

    const result = await pool.query(
      `INSERT INTO centralizador_1er_ano_2026 (
        estudiante_id, lugar_ciudad, departamento, dia, mes, ano, updated_at
      ) VALUES ($1::uuid, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      ON CONFLICT (estudiante_id) DO UPDATE SET
        lugar_ciudad = EXCLUDED.lugar_ciudad,
        departamento = EXCLUDED.departamento,
        dia = EXCLUDED.dia,
        mes = EXCLUDED.mes,
        ano = EXCLUDED.ano,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;`,
      [estudiante_id, lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4)]
    );

    return res.status(200).json({ message: "Fecha de centralización actualizada correctamente.", datos: result.rows[0] });
  } catch (error) {
    console.error("Error UPDATE Fecha Centralizador:", error);
    return res.status(500).json({ message: "Error al guardar la fecha de centralización.", error: error.message });
  }
};