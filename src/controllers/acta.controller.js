import { pool } from "../database/database.js";

// 1. OBTENER LISTA DE ACTAS FILTRADAS POR GESTIÓN Y AÑO
// OBTENER LISTA DE ACTAS FILTRADAS POR GESTIÓN Y AÑO (CORREGIDO Y OPTIMIZADO)
export const getActasByGestionAno = async (req, res) => {
  const { gestion, ano } = req.params;

  try {
    const query = `
      SELECT DISTINCT ON (u.id)
        u.id AS estudiante_id,
        u.username AS codigo_estudiante,
        u.nombre,
        u.apellido,
        u.ci,
        COALESCE(u.especialidad, 'Educación Primaria') AS especialidad,
        u.ano_formacion,
        COALESCE(u.estado, 'ACTIVO') AS estado_estudiante,
        da.nombre AS da_nombre,
        da.apellido AS da_apellido,
        COALESCE(a.id, uuid_generate_v4()) AS acta_id,
        CASE 
          WHEN u.estado = 'ACTIVO' THEN 'Validado' 
          ELSE 'En Revisión' 
        END AS estado_acta,
        MD5(u.id::text || $1::text) AS hash_blockchain
      FROM usuarios u
      INNER JOIN gestiones g 
        ON EXTRACT(YEAR FROM u.creado_en)::TEXT = g.anio 
       AND g.estado = 'Activa'
      LEFT JOIN asignaciones_docente_estudiante ade 
        ON u.id = ade.estudiante_id 
       AND ade.gestion = $1
      LEFT JOIN usuarios da 
        ON ade.docente_id = da.id 
       AND da.rol = 'DOCENTE_ACOMPANANTE'
      LEFT JOIN actas_oficiales a 
        ON u.id = a.estudiante_id
      WHERE u.rol = 'ESTUDIANTE'
        AND g.anio = $1
        AND (u.ano_formacion LIKE $2 OR u.ano_formacion LIKE $3)
      ORDER BY u.id, u.creado_en DESC
    `;

    const values = [gestion, `${ano}%`, `%${ano}º%`];
    const result = await pool.query(query, values);
    return res.json(result.rows);
  } catch (error) {
    console.error("Error al consultar actas IEPC-PEC:", error);
    return res.status(500).json({ 
      message: "Error al consultar actas IEPC-PEC.", 
      error: error.message 
    });
  }
};

// 2. REGISTRAR EVENTO DE AUDITORÍA EN EL HISTORIAL
export const registrarHistorialActa = async (req, res) => {
  const { estudianteId, accion, detalles, usuarioId } = req.body;
  try {
    const query = `
      INSERT INTO actas_historial (estudiante_id, usuario_accion_id, accion, detalles)
      VALUES ($1, $2, $3, $4) RETURNING *
    `;
    const result = await pool.query(query, [estudianteId, usuarioId || null, accion, detalles]);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Error al registrar historial.", error: error.message });
  }
};

// 3. OBTENER HISTORIAL AUDITABLE
export const getHistorialActa = async (req, res) => {
  const { estudianteId } = req.params;
  try {
    const query = `
      SELECT h.accion, h.detalles, h.fecha, COALESCE(u.nombre || ' ' || u.apellido, 'Sistema') AS usuario
      FROM actas_historial h
      LEFT JOIN usuarios u ON h.usuario_accion_id = u.id
      WHERE h.estudiante_id = $1
      ORDER BY h.fecha DESC
    `;
    const result = await pool.query(query, [estudianteId]);
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener historial.", error: error.message });
  }
};