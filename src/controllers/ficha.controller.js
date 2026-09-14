import { pool } from "../database/database.js";

// Mapeo completo de tablas de fichas 1ro a 4to Año
const TABLAS_FICHAS = {
  // 1ER AÑO
  "1_F1": "ficha_f1_1er_ano_2026",
  "1_F2": "ficha_f2_1er_ano_2026",
  "1_F3": "ficha_f3_1er_ano_2026",
  "1_F4": "ficha_f4_1er_ano_2026",
  "1_F5": "ficha_f5_1er_ano_2026",
  // 2DO AÑO
  "2_F1": "ficha_f1_2do_ano_2026",
  "2_F2": "ficha_f2_2do_ano_2026",
  "2_F3": "ficha_f3_2do_ano_2026",
  "2_F4": "ficha_f4_2do_ano_2026",
  "2_F5": "ficha_f5_2do_ano_2026",
  "2_F6": "ficha_f6_2do_ano_2026",
  // 3ER AÑO
  "3_A1": "ficha_a1_3er_ano_2026",
  "3_B1": "ficha_b1_3er_ano_2026",
  "3_B2": "ficha_b2_3er_ano_2026",
  "3_B3": "ficha_b3_3er_ano_2026",
  "3_B4": "ficha_b4_3er_ano_2026",
  "3_B5": "ficha_b5_3er_ano_2026",
  // 4TO AÑO (IEPC-PEC 2026)
  "4_A2": "ficha_a2_pdc_2026",
  "4_B6": "ficha_b6_seguimiento_tutor_2026",
  "4_B7": "ficha_b7_diagnostico_ue_2026",
  "4_C1": "ficha_c1_diseno_metodologico_2026",
  "4_C2": "ficha_c2_socializacion_comunitaria_2026",
  // CENTRALIZADOR GENERAL
  "CENTRALIZADOR": "centralizadores_notas"
};

const esUUIDValido = (uuid) => {
  if (typeof uuid !== 'string') return false;
  const regexUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regexUUID.test(uuid.trim());
};

// 1. OBTENER FICHA
export const getFichaEstudiante = async (req, res) => {
  const { estudiante_id, codigo_ficha } = req.params;
  const nombreTabla = TABLAS_FICHAS[codigo_ficha];

  if (!nombreTabla) {
    return res.status(400).json({ message: "Código de ficha no válido." });
  }

  try {
    const colsRes = await pool.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = $1
    `, [nombreTabla]);
    const columnas = colsRes.rows.map(r => r.column_name);

    let query = '';
    let params = [];

    if (columnas.includes('estudiante_id')) {
      query = `SELECT * FROM ${nombreTabla} WHERE estudiante_id = $1 LIMIT 1`;
      params = [estudiante_id];
    } else if (columnas.includes('equipo_id')) {
      const teamRes = await pool.query(
        `SELECT equipo_id FROM integrantes_equipo WHERE estudiante_id = $1 LIMIT 1`,
        [estudiante_id]
      );
      if (teamRes.rowCount === 0) {
        return res.status(200).json({ existe: false, datos: {} });
      }
      query = `SELECT * FROM ${nombreTabla} WHERE equipo_id = $1 LIMIT 1`;
      params = [teamRes.rows[0].equipo_id];
    } else {
      return res.status(200).json({ existe: false, datos: {} });
    }

    const result = await pool.query(query, params);

    if (result.rowCount === 0) {
      return res.status(200).json({ existe: false, datos: {} });
    }

    return res.status(200).json({ existe: true, datos: result.rows[0] });
  } catch (error) {
    console.error(`Error al obtener ficha ${codigo_ficha}:`, error);
    return res.status(500).json({ message: "Error al consultar la ficha.", error: error.message });
  }
};

// 2. GUARDAR / ACTUALIZAR FICHA ADAPTADA CON VALORES POR DEFECTO NOT NULL
export const saveOrUpdateFicha = async (req, res) => {
  const { estudiante_id, codigo_ficha, datos } = req.body;
  const nombreTabla = TABLAS_FICHAS[codigo_ficha];

  if (!nombreTabla) {
    return res.status(400).json({ message: "Código de ficha no válido." });
  }

  if (!datos || typeof datos !== 'object') {
    return res.status(400).json({ message: "Datos no proporcionados." });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Obtener/Crear equipo_id si es necesario
    let equipoId = datos.equipo_id;
    if (!equipoId || !esUUIDValido(equipoId)) {
      const teamCheck = await client.query(
        `SELECT equipo_id FROM integrantes_equipo WHERE estudiante_id = $1 LIMIT 1`,
        [estudiante_id]
      );

      if (teamCheck.rowCount > 0) {
        equipoId = teamCheck.rows[0].equipo_id;
      } else {
        const newTeam = await client.query(
          `INSERT INTO equipos_comunitarios (codigo_equipo, ano_formacion) 
           VALUES ($1, $2) RETURNING id`,
          [`EQ-AUTO-${Date.now()}`, '4to Año']
        );
        equipoId = newTeam.rows[0].id;

        await client.query(
          `INSERT INTO integrantes_equipo (equipo_id, estudiante_id) VALUES ($1, $2)`,
          [equipoId, estudiante_id]
        );
      }
    }

    // 2. Consultar columnas, tipos y restricciones IS_NULLABLE de la tabla
    const columnsRes = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = $1
    `, [nombreTabla]);
    
    const mapaColumnas = {};
    const esObligatoria = {};

    columnsRes.rows.forEach(r => {
      mapaColumnas[r.column_name] = r.data_type;
      esObligatoria[r.column_name] = (r.is_nullable === 'NO');
    });

    const tieneEstudianteId = mapaColumnas['estudiante_id'] !== undefined;
    const tieneEquipoId = mapaColumnas['equipo_id'] !== undefined;

    // 3. Determinar columna clave principal (estudiante_id o equipo_id)
    const columnaClave = tieneEstudianteId ? 'estudiante_id' : 'equipo_id';
    const valorClave = tieneEstudianteId ? estudiante_id : equipoId;

    // 4. Preparar payload con IDs resueltos
    const payload = { ...datos };
    if (tieneEstudianteId) payload.estudiante_id = estudiante_id;
    if (tieneEquipoId) payload.equipo_id = equipoId;

    // 5. Asignar valores por defecto para campos obligatorios NOT NULL si están vacíos
    if (esObligatoria['ano_formacion'] && (!payload.ano_formacion || payload.ano_formacion.trim() === '')) {
      const studentAnoRes = await client.query(`SELECT ano_formacion FROM estudiantes WHERE id = $1 LIMIT 1`, [estudiante_id]);
      payload.ano_formacion = studentAnoRes.rowCount > 0 ? studentAnoRes.rows[0].ano_formacion : '1er Año';
    }

    if (esObligatoria['titulo_diseno'] && (!payload.titulo_diseno || payload.titulo_diseno.trim() === '')) {
      payload.titulo_diseno = 'SIN TÍTULO REGISTRADO';
    }
    
    if (esObligatoria['modalidad_graduacion'] && (!payload.modalidad_graduacion || payload.modalidad_graduacion.trim() === '')) {
      payload.modalidad_graduacion = 'POR DEFINIR';
    }

    const clavesPermitidas = Object.keys(payload).filter(k => 
      k !== 'id' && 
      k !== 'creado_en' && 
      k !== 'actualizado_en' &&
      mapaColumnas[k] !== undefined
    );

    // 6. Procesar valores según tipo de dato y restricciones NOT NULL
    const procesarValor = (key, valor) => {
      const tipoDato = mapaColumnas[key];
      const obligatoria = esObligatoria[key];

      if (valor === '' || valor === undefined || valor === null) {
        if (obligatoria && (tipoDato === 'text' || tipoDato === 'character varying')) {
          return 'S/D';
        }
        return null;
      }

      if (key.endsWith('_id') || tipoDato === 'uuid') {
        return esUUIDValido(valor) ? valor : null;
      }

      if (tipoDato === 'integer' || tipoDato === 'numeric' || tipoDato === 'double precision') {
        const num = parseFloat(valor);
        return isNaN(num) ? (obligatoria ? 0 : null) : num;
      }

      return valor;
    };

    // 7. Verificar existencia previa
    const checkQuery = `SELECT id FROM ${nombreTabla} WHERE "${columnaClave}" = $1 LIMIT 1`;
    const checkResult = await client.query(checkQuery, [valorClave]);

    if (checkResult.rowCount > 0) {
      // UPDATE DINÁMICO
      const clavesUpdate = clavesPermitidas.filter(k => k !== columnaClave);
      if (clavesUpdate.length === 0) {
        await client.query('COMMIT');
        return res.json({ message: "Sin cambios para actualizar." });
      }

      const setClause = clavesUpdate.map((key, idx) => `"${key}" = $${idx + 2}`).join(", ");
      const values = clavesUpdate.map(key => procesarValor(key, payload[key]));

      const updateQuery = `UPDATE ${nombreTabla} SET ${setClause} WHERE "${columnaClave}" = $1 RETURNING *`;
      const updateResult = await client.query(updateQuery, [valorClave, ...values]);

      await client.query('COMMIT');
      return res.json({ message: "Ficha actualizada correctamente.", datos: updateResult.rows[0] });

    } else {
      // INSERT DINÁMICO
      const cols = clavesPermitidas.map(k => `"${k}"`).join(", ");
      const placeholders = clavesPermitidas.map((_, idx) => `$${idx + 1}`).join(", ");
      const values = clavesPermitidas.map(key => procesarValor(key, payload[key]));

      const insertQuery = `INSERT INTO ${nombreTabla} (${cols}) VALUES (${placeholders}) RETURNING *`;
      const insertResult = await client.query(insertQuery, values);

      await client.query('COMMIT');
      return res.status(201).json({ message: "Ficha registrada correctamente.", datos: insertResult.rows[0] });
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Error al guardar/actualizar ficha ${codigo_ficha}:`, error);
    return res.status(500).json({ 
      message: `Error al guardar la ficha ${codigo_ficha} en PostgreSQL.`, 
      error: error.message 
    });
  } finally {
    client.release();
  }
};

// 3. ELIMINAR FICHA
export const deleteFicha = async (req, res) => {
  const { estudiante_id, codigo_ficha } = req.params;
  const nombreTabla = TABLAS_FICHAS[codigo_ficha];

  if (!nombreTabla) {
    return res.status(400).json({ message: "Código de ficha no válido." });
  }

  try {
    const colsRes = await pool.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = $1
    `, [nombreTabla]);
    const columnas = colsRes.rows.map(r => r.column_name);

    if (columnas.includes('estudiante_id')) {
      await pool.query(`DELETE FROM ${nombreTabla} WHERE estudiante_id = $1`, [estudiante_id]);
    } else if (columnas.includes('equipo_id')) {
      const teamRes = await pool.query(
        `SELECT equipo_id FROM integrantes_equipo WHERE estudiante_id = $1 LIMIT 1`,
        [estudiante_id]
      );
      if (teamRes.rowCount > 0) {
        await pool.query(`DELETE FROM ${nombreTabla} WHERE equipo_id = $1`, [teamRes.rows[0].equipo_id]);
      }
    }

    return res.json({ message: "Registro de la ficha eliminado correctamente." });
  } catch (error) {
    console.error(`Error al eliminar ficha ${codigo_ficha}:`, error);
    return res.status(500).json({ message: "Error al eliminar la ficha.", error: error.message });
  }
};