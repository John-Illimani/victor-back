import { pool } from "../database/database.js";

// 1. OBTENER GESTIONES CON CONTEO REAL POR AÑO
export const getGestiones = async (req, res) => {
  try {
    const query = `
      SELECT 
        g.id, 
        g.anio AS gestion, 
        g.descripcion, 
        g.estado, 
        TO_CHAR(g.fecha_inicio, 'YYYY-MM-DD') AS "fechaInicio", 
        TO_CHAR(g.fecha_fin, 'YYYY-MM-DD') AS "fechaFin",
        -- Conteo de estudiantes registrados exactamente en ese año
        (
          SELECT COUNT(*)::INT 
          FROM usuarios 
          WHERE rol = 'ESTUDIANTE' 
            AND EXTRACT(YEAR FROM creado_en)::TEXT = g.anio
        ) AS "totalEstudiantes",
        -- Conteo de actas creadas en ese año
        (
          SELECT COUNT(*)::INT 
          FROM actas_oficiales 
          WHERE EXTRACT(YEAR FROM creado_en)::TEXT = g.anio
        ) AS "totalActas"
      FROM gestiones g
      ORDER BY g.anio DESC
    `;
    const result = await pool.query(query);
    return res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener gestiones:", error);
    return res.status(500).json({ message: "Error al consultar las gestiones.", error: error.message });
  }
};

// 2. CREAR NUEVA GESTIÓN
export const createGestion = async (req, res) => {
  const { gestion, descripcion, fechaInicio, fechaFin, estado } = req.body;

  try {
    const checkRes = await pool.query(`SELECT id FROM gestiones WHERE anio = $1`, [gestion]);
    if (checkRes.rowCount > 0) {
      return res.status(400).json({ message: `La gestión ${gestion} ya se encuentra registrada.` });
    }

    const query = `
      INSERT INTO gestiones (anio, descripcion, fecha_inicio, fecha_fin, estado)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, anio AS gestion, descripcion, estado, fecha_inicio AS "fechaInicio", fecha_fin AS "fechaFin"
    `;
    const values = [gestion, descripcion, fechaInicio || null, fechaFin || null, estado || 'Cerrada'];
    const result = await pool.query(query, values);

    return res.status(201).json({ message: "Gestión creada exitosamente.", gestion: result.rows[0] });
  } catch (error) {
    console.error("Error al crear gestión:", error);
    return res.status(500).json({ message: "Error al guardar la nueva gestión.", error: error.message });
  }
};

// 3. EDITAR DATOS DE LA GESTIÓN
export const updateGestion = async (req, res) => {
  const { id } = req.params;
  const { descripcion, fechaInicio, fechaFin, estado } = req.body;

  try {
    const query = `
      UPDATE gestiones 
      SET 
        descripcion = COALESCE($1, descripcion),
        fecha_inicio = COALESCE($2, fecha_inicio),
        fecha_fin = COALESCE($3, fecha_fin),
        estado = COALESCE($4, estado),
        actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, anio AS gestion, descripcion, estado, fecha_inicio AS "fechaInicio", fecha_fin AS "fechaFin"
    `;
    const values = [descripcion, fechaInicio || null, fechaFin || null, estado, id];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Gestión no encontrada." });
    }

    return res.json({ message: "Gestión actualizada correctamente.", gestion: result.rows[0] });
  } catch (error) {
    console.error("Error al actualizar gestión:", error);
    return res.status(500).json({ message: "Error al actualizar la gestión.", error: error.message });
  }
};

// 4. CAMBIAR ESTADO Y DESHABILITAR/HABILITAR REGISTROS DEL AÑO
export const toggleEstadoGestion = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; // 'Activa' o 'Cerrada'

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Actualizar el estado de la gestión
    const gestionRes = await client.query(
      `UPDATE gestiones SET estado = $1, actualizado_en = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, anio, estado`,
      [estado, id]
    );

    if (gestionRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: "Gestión no encontrada." });
    }

    const anioGestion = gestionRes.rows[0].anio;
    const nuevoEstadoEstudiante = estado === 'Activa' ? 'ACTIVO' : 'INACTIVO';

    // Propagar el estado a todos los usuarios/estudiantes de esa gestión
    await client.query(
      `UPDATE usuarios 
       SET estado = $1 
       WHERE rol = 'ESTUDIANTE' 
         AND EXTRACT(YEAR FROM creado_en)::TEXT = $2`,
      [nuevoEstadoEstudiante, anioGestion]
    );

    await client.query('COMMIT');
    return res.json({ 
      message: `Gestión ${anioGestion} marcada como ${estado}. Los estudiantes asociados se actualizaron a ${nuevoEstadoEstudiante}.` 
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error al cambiar estado de gestión:", error);
    return res.status(500).json({ message: "Error al cambiar el estado de la gestión.", error: error.message });
  } finally {
    client.release();
  }
};