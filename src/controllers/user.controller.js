import bcrypt from "bcryptjs";
import { pool } from "../database/database.js";

// READ: Obtener usuarios con JOIN a Unidades Educativas e incluir el ESTADO
export const getUsers = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.correo, 
        u.nombre, 
        u.apellido, 
        u.ci, 
        u.telefono,
        u.rol, 
        u.estado,
        u.esfm_ua,
        u.especialidad,
        u.item_docente,
        u.unidad_educativa_id,
        ue.nombre AS unidad_educativa_nombre,
        u.creado_en,
        COALESCE(u.formularios_habilitados, '{}'::jsonb) AS formularios_habilitados
      FROM usuarios u
      LEFT JOIN unidades_educativas ue ON u.unidad_educativa_id = ue.id
      ORDER BY u.creado_en DESC
    `;
    const result = await pool.query(query);
    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return res.status(500).json({ 
      message: "Error al obtener la lista de usuarios.", 
      error: error.message 
    });
  }
};

// CREATE: Crear usuario incluyendo el ESTADO
export const createUser = async (req, res) => {
  const { 
    username, 
    correo, 
    password, 
    nombre, 
    apellido, 
    ci, 
    telefono, 
    rol, 
    estado,
    esfm_ua, 
    especialidad, 
    item_docente, 
    unidad_educativa_id 
  } = req.body;

  if (!username || !nombre || !apellido || !ci) {
    return res.status(400).json({ message: "Nombre de usuario, nombre, apellido y C.I. son requeridos." });
  }

  try {
    const rawPassword = password || `${ci}*`;
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const generatedEmail = correo || `${ci}@${rol === 'ESTUDIANTE' ? 'est.' : ''}esfm.edu.bo`;

    const query = `
      INSERT INTO usuarios (
        username, correo, password_hash, rol, estado, nombre, apellido, ci, 
        telefono, esfm_ua, especialidad, item_docente, unidad_educativa_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, username, correo, rol, estado, nombre, apellido, ci, telefono, esfm_ua, especialidad, item_docente, unidad_educativa_id, creado_en
    `;
    const values = [
      username,
      generatedEmail,
      hashedPassword,
      rol || "ESTUDIANTE",
      estado || "ACTIVO",
      nombre,
      apellido,
      ci,
      telefono || null,
      esfm_ua || "ESFM/UA - El Alto",
      especialidad || null,
      item_docente || null,
      unidad_educativa_id || null
    ];

    const result = await pool.query(query, values);

    return res.status(201).json({ message: "Usuario creado exitosamente.", user: result.rows[0] });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    if (error.code === "23505") {
      return res.status(400).json({ message: "El usuario, correo electrónico o C.I. ya se encuentra registrado." });
    }
    return res.status(500).json({ message: "Error al registrar el usuario.", error: error.message });
  }
};

// UPDATE: Editar usuario incluyendo el ESTADO
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { 
    username, 
    correo, 
    password, 
    nombre, 
    apellido, 
    ci, 
    telefono, 
    rol, 
    estado,
    esfm_ua, 
    especialidad, 
    item_docente, 
    unidad_educativa_id 
  } = req.body;

  try {
    const generatedEmail = correo || `${ci}@${rol === 'ESTUDIANTE' ? 'est.' : ''}esfm.edu.bo`;

    let query = '';
    let values = [];

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `
        UPDATE usuarios 
        SET username = $1, correo = $2, password_hash = $3, nombre = $4, apellido = $5, 
            ci = $6, telefono = $7, rol = $8, estado = $9, esfm_ua = $10, especialidad = $11, 
            item_docente = $12, unidad_educativa_id = $13
        WHERE id = $14
        RETURNING id, username, correo, nombre, apellido, ci, rol, estado, esfm_ua, especialidad, item_docente, unidad_educativa_id
      `;
      values = [
        username, generatedEmail, hashedPassword, nombre, apellido, ci, 
        telefono || null, rol, estado || 'ACTIVO', esfm_ua, especialidad || null, 
        item_docente || null, unidad_educativa_id || null, id
      ];
    } else {
      query = `
        UPDATE usuarios 
        SET username = $1, correo = $2, nombre = $3, apellido = $4, ci = $5, 
            telefono = $6, rol = $7, estado = $8, esfm_ua = $9, especialidad = $10, 
            item_docente = $11, unidad_educativa_id = $12
        WHERE id = $13
        RETURNING id, username, correo, nombre, apellido, ci, rol, estado, esfm_ua, especialidad, item_docente, unidad_educativa_id
      `;
      values = [
        username, generatedEmail, nombre, apellido, ci, 
        telefono || null, rol, estado || 'ACTIVO', esfm_ua, especialidad || null, 
        item_docente || null, unidad_educativa_id || null, id
      ];
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    return res.json({ message: "Usuario actualizado correctamente.", user: result.rows[0] });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    if (error.code === "23505") {
      return res.status(400).json({ message: "El nombre de usuario, correo o C.I. ya está en uso." });
    }
    return res.status(500).json({ message: "Error al actualizar usuario.", error: error.message });
  }
};

// TOGGLE STATUS: Activar / Desactivar usuario
export const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; // 'ACTIVO' o 'INACTIVO'

  if (!['ACTIVO', 'INACTIVO'].includes(estado)) {
    return res.status(400).json({ message: "El estado proporcionado debe ser ACTIVO o INACTIVO." });
  }

  try {
    const query = `
      UPDATE usuarios 
      SET estado = $1 
      WHERE id = $2 
      RETURNING id, username, estado
    `;
    const result = await pool.query(query, [estado, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    return res.json({ 
      message: `El estado del usuario ${result.rows[0].username} cambió a ${estado}.`, 
      user: result.rows[0] 
    });
  } catch (error) {
    console.error("Error al cambiar estado del usuario:", error);
    return res.status(500).json({ message: "Error al cambiar el estado del usuario.", error: error.message });
  }
};

// DELETE: Eliminar usuario individual
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `DELETE FROM usuarios WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    return res.json({ message: "Usuario eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    if (error.code === '23503') {
      return res.status(400).json({ message: "No se puede eliminar el usuario porque está vinculado a registros o evaluaciones activas." });
    }
    return res.status(500).json({ message: "Error al eliminar usuario.", error: error.message });
  }
};

// DELETE BATCH: Eliminar lote por arreglo de UUIDs
export const deleteMultipleUsers = async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Se requiere una lista válida de IDs (UUID) para eliminar." });
  }

  try {
    const query = `DELETE FROM usuarios WHERE id = ANY($1::uuid[]) RETURNING id`;
    const result = await pool.query(query, [ids]);

    return res.json({ 
      message: `${result.rowCount} usuarios fueron eliminados correctamente.`,
      deletedIds: result.rows.map(r => r.id)
    });
  } catch (error) {
    console.error("Error al eliminar usuarios en lote:", error);
    return res.status(500).json({ message: "Error al eliminar la lista de usuarios.", error: error.message });
  }
};

// IMPORTACIÓN EN LOTE (EXCEL)
export const importBatchUsers = async (req, res) => {
  const { usuarios } = req.body;

  if (!usuarios || !Array.isArray(usuarios) || usuarios.length === 0) {
    return res.status(400).json({ message: "Se requiere un arreglo válido de usuarios para importar." });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let insertados = 0;

    for (const u of usuarios) {
      const rawPassword = u.password || `${u.ci}*`;
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      const primerNombre = (u.nombre || '').trim().split(' ')[0].toLowerCase();
      const generatedUsername = u.username || `${primerNombre}_${u.ci}`;
      const generatedEmail = u.correo || `${u.ci}@${u.rol === 'ESTUDIANTE' ? 'est.' : ''}esfm.edu.bo`;

      const query = `
        INSERT INTO usuarios (
          username, correo, password_hash, rol, estado, nombre, apellido, ci, 
          telefono, esfm_ua, especialidad, item_docente, genero, modalidad_ingreso, ano_formacion
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (ci) DO UPDATE SET
          username = EXCLUDED.username,
          nombre = EXCLUDED.nombre,
          apellido = EXCLUDED.apellido,
          correo = EXCLUDED.correo,
          rol = EXCLUDED.rol,
          estado = EXCLUDED.estado,
          especialidad = EXCLUDED.especialidad,
          genero = EXCLUDED.genero,
          modalidad_ingreso = EXCLUDED.modalidad_ingreso,
          ano_formacion = EXCLUDED.ano_formacion
      `;

      const values = [
        generatedUsername,
        generatedEmail,
        hashedPassword,
        u.rol || "ESTUDIANTE",
        u.estado || "ACTIVO",
        u.nombre,
        u.apellido,
        u.ci,
        u.telefono || null,
        u.esfm_ua || "ESFM/UA - El Alto",
        u.especialidad || null,
        u.item_docente || u.codigo || null,
        u.genero || null,
        u.modalidad_ingreso || null,
        u.ano_formacion || null
      ];

      await client.query(query, values);
      insertados++;
    }

    await client.query('COMMIT');

    return res.json({
      message: `Se importaron y procesaron ${insertados} usuarios exitosamente.`,
      count: insertados
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error en la importación en lote:", error);
    return res.status(500).json({ message: "Error al procesar la importación masiva.", error: error.message });
  } finally {
    client.release();
  }
};

// PERFIL: Actualizar datos personales del usuario logueado
export const updateMyProfile = async (req, res) => {
  const userId = req.user?.id;
  const { nombre, apellido, username, telefono } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Usuario no autenticado." });
  }

  if (!nombre || !apellido || !username) {
    return res.status(400).json({ message: "Nombre, apellido y username son obligatorios." });
  }

  try {
    const query = `
      UPDATE usuarios 
      SET nombre = $1, apellido = $2, username = $3, telefono = $4
      WHERE id = $5
      RETURNING id, username, correo, nombre, apellido, ci, rol, estado, telefono
    `;
    const values = [nombre, apellido, username, telefono || null, userId];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado en la base de datos." });
    }

    return res.json({ 
      message: "Perfil actualizado correctamente.", 
      user: result.rows[0] 
    });
  } catch (error) {
    console.error("Error al actualizar perfil del usuario:", error);
    if (error.code === "23505") {
      return res.status(400).json({ message: "El nombre de usuario ya está registrado por otra persona." });
    }
    return res.status(500).json({ message: "Error interno al actualizar el perfil.", error: error.message });
  }
};

// SEGURIDAD: Cambiar contraseña del usuario logueado
export const changeMyPassword = async (req, res) => {
  const userId = req.user?.id;
  const { currentPassword, newPassword } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Usuario no autenticado." });
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Debe proporcionar la contraseña actual y la nueva contraseña." });
  }

  try {
    // 1. Obtener la hash actual
    const userRes = await pool.query("SELECT password_hash FROM usuarios WHERE id = $1", [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const currentHash = userRes.rows[0].password_hash;

    // 2. Verificar la contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, currentHash);
    if (!isMatch) {
      return res.status(400).json({ message: "La contraseña actual es incorrecta." });
    }

    // 3. Encriptar y guardar la nueva contraseña
    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE usuarios SET password_hash = $1 WHERE id = $2", [newHash, userId]);

    return res.json({ message: "Contraseña actualizada exitosamente." });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return res.status(500).json({ message: "Error interno al cambiar la contraseña.", error: error.message });
  }
};


// OBTENER PERFIL: Devuelve los datos del usuario logueado en la sesión activa
export const getMyProfile = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Usuario no autenticado." });
  }

  try {
    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.correo, 
        u.nombre, 
        u.apellido, 
        u.ci, 
        u.telefono,
        u.rol, 
        u.estado,
        u.esfm_ua,
        u.especialidad,
        u.item_docente,
        u.unidad_educativa_id,
        ue.nombre AS unidad_educativa_nombre,
        u.creado_en,
        COALESCE(u.formularios_habilitados, '{}'::jsonb) AS formularios_habilitados
      FROM usuarios u
      LEFT JOIN unidades_educativas ue ON u.unidad_educativa_id = ue.id
      WHERE u.id = $1
    `;
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener perfil del usuario:", error);
    return res.status(500).json({ 
      message: "Error al obtener la información del perfil.", 
      error: error.message 
    });
  }
};




export const getMyStudentProfile = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Usuario no autenticado." });
  }

  try {
    const query = `
      SELECT 
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
        u.ano_formacion,
        ue.nombre AS unidad_educativa_nombre,

        -- Obtiene de forma única al Docente Acompañante ESFM
        da.id AS docente_acompanante_id,
        da.nombre AS da_nombre,
        da.apellido AS da_apellido,

        -- Obtiene de forma única al Docente Guía U.E.
        dg.id AS docente_guia_id,
        dg.nombre AS dg_nombre,
        dg.apellido AS dg_apellido

      FROM usuarios u
      LEFT JOIN unidades_educativas ue ON u.unidad_educativa_id = ue.id

      -- Subconsulta para Docente Acompañante
      LEFT JOIN LATERAL (
        SELECT d.id, d.nombre, d.apellido
        FROM asignaciones_docente_estudiante ade
        INNER JOIN usuarios d ON ade.docente_id = d.id
        WHERE ade.estudiante_id = u.id AND d.rol = 'DOCENTE_ACOMPANANTE'
        LIMIT 1
      ) da ON TRUE

      -- Subconsulta para Docente Guía
      LEFT JOIN LATERAL (
        SELECT d.id, d.nombre, d.apellido
        FROM asignaciones_docente_estudiante ade
        INNER JOIN usuarios d ON ade.docente_id = d.id
        WHERE ade.estudiante_id = u.id AND d.rol = 'DOCENTE_GUIA'
        LIMIT 1
      ) dg ON TRUE

      WHERE u.id = $1::uuid AND u.rol = 'ESTUDIANTE';
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Perfil de estudiante no encontrado." });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener perfil completo del estudiante:", error);
    return res.status(500).json({ message: "Error al consultar la información del estudiante.", error: error.message });
  }
};