import bcrypt from "bcryptjs";
import { pool } from "../database/database.js";

// 1. OBTENER ESTUDIANTES CON DOCENTE ACOMPAÑANTE ASIGNADO
// OBTENER ESTUDIANTES DE GESTIONES ACTIVAS 
export const getStudents = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT ON (u.id)
        u.id, 
        u.username, 
        u.correo, 
        u.nombre, 
        u.apellido, 
        u.ci, 
        u.telefono,
        u.rol, 
        COALESCE(u.estado, 'ACTIVO') AS estado,
        u.esfm_ua,
        u.especialidad,
        u.genero,
        u.modalidad_ingreso,
        u.ano_formacion,
        u.unidad_educativa_id,
        EXTRACT(YEAR FROM u.creado_en)::TEXT AS gestion_academica,
        ue.nombre AS unidad_educativa_nombre,
        ade.docente_id AS docente_acompanante_id,
        da.nombre AS da_nombre, 
        da.apellido AS da_apellido,
        u.creado_en 
      FROM usuarios u
      INNER JOIN gestiones g 
        ON EXTRACT(YEAR FROM u.creado_en)::TEXT = g.anio 
       AND g.estado = 'Activa'
      LEFT JOIN unidades_educativas ue ON u.unidad_educativa_id = ue.id
      LEFT JOIN asignaciones_docente_estudiante ade ON u.id = ade.estudiante_id
      LEFT JOIN usuarios da ON ade.docente_id = da.id AND da.rol = 'DOCENTE_ACOMPANANTE'
      WHERE u.rol = 'ESTUDIANTE'
      ORDER BY u.id, u.creado_en DESC
    `;
    const result = await pool.query(query);
    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener estudiantes sin duplicados:", error);
    return res.status(500).json({ 
      message: "Error al obtener la lista de estudiantes.", 
      error: error.message 
    });
  }
};

// 2. CREAR ESTUDIANTE INDIVIDUAL
export const createStudent = async (req, res) => {
  const { 
    username, password, nombre, nombres, apellido, apellidos, ci, telefono, estado, 
    esfm_ua, especialidad, genero, modalidad_ingreso, ano_formacion, unidad_educativa_id,
    docente_acompanante_id
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const finalNombre = (nombre || nombres || '').trim();
    const finalApellido = (apellido || apellidos || '').trim();
    const finalCi = (ci || '').trim();

    const rawPassword = password || `${finalCi}*`;
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const primerNombre = finalNombre.split(' ')[0].toLowerCase();
    const generatedUsername = username || `${primerNombre}_${finalCi}`;
    const generatedEmail = `${finalCi}@est.esfm.edu.bo`;

    const queryUser = `
      INSERT INTO usuarios (
        username, correo, password_hash, rol, estado, nombre, apellido, ci, 
        telefono, esfm_ua, especialidad, genero, modalidad_ingreso, ano_formacion, unidad_educativa_id
      )
      VALUES ($1, $2, $3, 'ESTUDIANTE', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, username, nombre, apellido, ci, rol, estado
    `;

    const valuesUser = [
      generatedUsername, generatedEmail, hashedPassword, estado || 'ACTIVO', finalNombre, finalApellido, finalCi, 
      telefono || null, esfm_ua || "ESFM/UA - El Alto", especialidad || null, genero || null, 
      modalidad_ingreso || null, ano_formacion || null, unidad_educativa_id || null
    ];

    const resultUser = await client.query(queryUser, valuesUser);
    const newStudentId = resultUser.rows[0].id;

    // Asignar docente si viene especificado
    if (docente_acompanante_id) {
      await client.query(`
        INSERT INTO asignaciones_docente_estudiante (docente_id, estudiante_id, gestion)
        VALUES ($1::uuid, $2::uuid, '2026')
        ON CONFLICT (docente_id, estudiante_id, gestion) DO NOTHING
      `, [docente_acompanante_id, newStudentId]);
    }

    await client.query('COMMIT');
    return res.status(201).json({ message: "Estudiante registrado correctamente.", student: resultUser.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error al registrar estudiante:", error);
    return res.status(500).json({ message: "Error al registrar estudiante.", error: error.message });
  } finally {
    client.release();
  }
};

// 3. ACTUALIZAR ESTUDIANTE Y SU ASIGNACIÓN
export const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { 
    username, password, nombre, nombres, apellido, apellidos, ci, telefono, estado, 
    esfm_ua, especialidad, genero, modalidad_ingreso, ano_formacion, 
    unidad_educativa_id, docente_acompanante_id 
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const finalNombre = (nombre || nombres || '').trim();
    const finalApellido = (apellido || apellidos || '').trim();
    const finalCi = (ci || '').trim();
    const generatedEmail = `${finalCi}@est.esfm.edu.bo`;

    let userQuery = `
      UPDATE usuarios SET
        username = $1, correo = $2, nombre = $3, apellido = $4, ci = $5,
        telefono = $6, estado = $7, esfm_ua = $8, especialidad = $9,
        genero = $10, modalidad_ingreso = $11, ano_formacion = $12, unidad_educativa_id = $13
    `;
    const userValues = [
      username, generatedEmail, finalNombre, finalApellido, finalCi, 
      telefono || null, estado || 'ACTIVO', esfm_ua || "ESFM/UA - El Alto", 
      especialidad || null, genero || null, modalidad_ingreso || null, 
      ano_formacion || null, unidad_educativa_id || null
    ];

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      userValues.push(hashedPassword);
      userQuery += `, password_hash = $${userValues.length}`;
    }

    userValues.push(id);
    userQuery += ` WHERE id = $${userValues.length} AND rol = 'ESTUDIANTE' RETURNING *`;
    
    const userResult = await client.query(userQuery, userValues);
    if (userResult.rowCount === 0) {
      throw new Error("Estudiante no encontrado.");
    }

    // Actualizar asignación de docente acompañante
    if (docente_acompanante_id) {
      await client.query(`DELETE FROM asignaciones_docente_estudiante WHERE estudiante_id = $1::uuid`, [id]);
      await client.query(`
        INSERT INTO asignaciones_docente_estudiante (docente_id, estudiante_id, gestion)
        VALUES ($1::uuid, $2::uuid, '2026')
      `, [docente_acompanante_id, id]);
    }

    await client.query('COMMIT');
    return res.json({ message: "Datos actualizados correctamente.", student: userResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error al actualizar estudiante:", error);
    return res.status(500).json({ message: "Error al actualizar estudiante.", error: error.message });
  } finally {
    client.release();
  }
};

// 4. CAMBIAR ESTADO RÁPIDO
export const toggleStudentStatus = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    const query = `UPDATE usuarios SET estado = $1 WHERE id = $2 AND rol = 'ESTUDIANTE' RETURNING id, username, estado`;
    const result = await pool.query(query, [estado, id]);
    return res.json({ message: `El estado del estudiante cambió a ${estado}.`, student: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ message: "Error al cambiar estado.", error: error.message });
  }
};

// 5. ELIMINAR ESTUDIANTE INDIVIDUAL
export const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM usuarios WHERE id = $1 AND rol = 'ESTUDIANTE'", [id]);
    return res.json({ message: "Estudiante eliminado exitosamente." });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar estudiante.", error: error.message });
  }
};

// 6. ELIMINACIÓN MASIVA
export const deleteMultipleStudents = async (req, res) => {
  const { ids } = req.body;
  try {
    const result = await pool.query("DELETE FROM usuarios WHERE id = ANY($1::uuid[]) AND rol = 'ESTUDIANTE'", [ids]);
    return res.json({ message: `Se eliminaron ${result.rowCount} estudiantes exitosamente.` });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar lista de estudiantes.", error: error.message });
  }
};

// 7. IMPORTACIÓN MASIVA EXCEL
export const importBatchStudents = async (req, res) => {
  const { estudiantes } = req.body;
  if (!estudiantes || !Array.isArray(estudiantes)) {
    return res.status(400).json({ message: "Arreglo de estudiantes no válido." });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const est of estudiantes) {
      const rawPassword = est.password || `${est.ci}*`;
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      const primerNombre = (est.nombre || '').trim().split(' ')[0].toLowerCase();
      const generatedUsername = est.username || `${primerNombre}_${est.ci}`;
      const generatedEmail = `${est.ci}@est.esfm.edu.bo`;

      const query = `
        INSERT INTO usuarios (username, correo, password_hash, rol, estado, nombre, apellido, ci, esfm_ua, especialidad, genero, modalidad_ingreso, ano_formacion)
        VALUES ($1, $2, $3, 'ESTUDIANTE', 'ACTIVO', $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (ci) DO UPDATE SET
          username = EXCLUDED.username,
          nombre = EXCLUDED.nombre,
          apellido = EXCLUDED.apellido,
          especialidad = EXCLUDED.especialidad,
          ano_formacion = EXCLUDED.ano_formacion
      `;
      await client.query(query, [
        generatedUsername, generatedEmail, hashedPassword, est.nombre, est.apellido, 
        est.ci, est.esfm_ua || "ESFM/UA - El Alto", est.especialidad, est.genero, est.modalidad_ingreso, est.ano_formacion
      ]);
    }
    await client.query('COMMIT');
    return res.json({ message: `Procesados ${estudiantes.length} estudiantes.` });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(500).json({ message: "Error en importación masiva.", error: error.message });
  } finally {
    client.release();
  }
};