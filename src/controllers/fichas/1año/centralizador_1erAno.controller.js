import { pool } from "../../../database/database.js";

// Función auxiliar para convertir números a literales
function numeroALiteral(num) {
  const n = parseFloat(num);
  if (isNaN(n) || n <= 0) return "CERO CON 00/100";

  const unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
  const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  const especiales = {
    11: "ONCE", 12: "DOCE", 13: "TRECE", 14: "CATORCE", 15: "QUINCE",
    16: "DIECISÉIS", 17: "DIECISIETE", 18: "DIECIOCHO", 19: "DIECINUEVE",
    21: "VEINTIUNO", 22: "VEINTIDÓS", 23: "VEINTITRÉS", 24: "VEINTICUATRO",
    25: "VEINTICINCO", 26: "VEINTISÉIS", 27: "VEINTISIETE", 28: "VEINTIOCHO", 29: "VEINTINUEVE"
  };

  const convertirDecenas = (val) => {
    if (val < 10) return unidades[val];
    if (especiales[val]) return especiales[val];
    const d = Math.floor(val / 10);
    const u = val % 10;
    if (d === 2) return `VEINTI${unidades[u]}`;
    return u === 0 ? decenas[d] : `${decenas[d]} Y ${unidades[u]}`;
  };

  const parteEntera = Math.floor(n);
  const parteDecimal = Math.round((n - parteEntera) * 100);

  let literal = "";
  if (parteEntera === 100) {
    literal = "CIEN";
  } else if (parteEntera > 0) {
    const c = Math.floor(parteEntera / 100);
    const resto = parteEntera % 100;
    const centenas = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];
    if (c > 0) literal += centenas[c] + " ";
    if (resto > 0) literal += convertirDecenas(resto);
  } else {
    literal = "CERO";
  }

  const decStr = parteDecimal < 10 ? `0${parteDecimal}` : `${parteDecimal}`;
  literal += ` CON ${decStr}/100`;

  return literal.trim();
}

// GET - CONSULTAR CENTRALIZADOR DE 1ER AÑO
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
      return res.status(200).json({ existe: false, datos: {} });
    }

    const row = result.rows[0];
    row.promedio_literal = numeroALiteral(row.promedio_numeral || 0);

    return res.status(200).json({ existe: true, datos: row });
  } catch (error) {
    console.error("Error GET Centralizador 1er Año:", error);
    return res.status(500).json({ message: "Error al consultar la base de datos.", error: error.message });
  }
};

// POST - GUARDAR O ACTUALIZAR
export const updateFechaCentralizador_1erAno = async (req, res) => {
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
      nota_f1 = 0, nota_f2 = 0, nota_f3 = 0,
      nota_f4 = 0, nota_f5 = 0,
      promedio_numeral = 0,
      promedio_literal = 'CERO CON 00/100',
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
      INSERT INTO centralizador_1er_ano_2026 (
        estudiante_id, apellidos_nombres, esfm_ua, especialidad,
        nota_f1, nota_f2, nota_f3, nota_f4, nota_f5,
        promedio_numeral, promedio_literal,
        lugar_ciudad, departamento, dia, mes, ano, updated_at
      ) VALUES (
        $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP
      )
      ON CONFLICT (estudiante_id) DO UPDATE SET
        apellidos_nombres = EXCLUDED.apellidos_nombres,
        esfm_ua = EXCLUDED.esfm_ua,
        especialidad = EXCLUDED.especialidad,
        nota_f1 = EXCLUDED.nota_f1,
        nota_f2 = EXCLUDED.nota_f2,
        nota_f3 = EXCLUDED.nota_f3,
        nota_f4 = EXCLUDED.nota_f4,
        nota_f5 = EXCLUDED.nota_f5,
        promedio_numeral = EXCLUDED.promedio_numeral,
        promedio_literal = EXCLUDED.promedio_literal,
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
      parseNum(nota_f1), parseNum(nota_f2), parseNum(nota_f3),
      parseNum(nota_f4), parseNum(nota_f5),
      parseNum(promedio_numeral), promedio_literal,
      lugar_ciudad, departamento, dia, mes, String(ano).slice(0, 4)
    ];

    const result = await client.query(query, values);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Centralizador de 1er Año guardado correctamente.", datos: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error SAVE Centralizador 1er Año:", error);
    return res.status(500).json({ message: "Error interno al guardar el Centralizador.", error: error.message });
  } finally {
    client.release();
  }
};

// DELETE - ELIMINAR CENTRALIZADOR
export const deleteCentralizador_1erAno = async (req, res) => {
  const { estudiante_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM centralizador_1er_ano_2026 WHERE estudiante_id = $1::uuid RETURNING id`,
      [estudiante_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "El registro no existe o ya fue eliminado." });
    }
    return res.status(200).json({ message: "Centralizador eliminado correctamente." });
  } catch (error) {
    console.error("Error DELETE Centralizador 1er Año:", error);
    return res.status(500).json({ message: "Error al eliminar el Centralizador.", error: error.message });
  }
};