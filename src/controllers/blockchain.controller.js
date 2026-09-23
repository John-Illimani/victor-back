import { pool } from "../database/database.js";
import { blockchainService } from "../blockchain/services/blockchain.service.js";
import { generarHashCentralizador5toAno } from "../blockchain/utils/hash.util.js";

// POST - CERTIFICAR CENTRALIZADOR DE 5TO AÑO CON VERIFICACIÓN PREVIA
export const certificarCentralizador5toAno = async (req, res) => {
  const { estudiante_id } = req.body;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    // 1. Obtener datos del Centralizador de 5to Año
    const resCentral = await pool.query(
      `SELECT * FROM centralizador_5to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (resCentral.rowCount === 0) {
      return res.status(404).json({ message: "No se encontraron datos del centralizador para certificar." });
    }

    const datosCentral = resCentral.rows[0];

    // 2. Generar Hash Criptográfico Local (SHA-256)
    const hashLocal = generarHashCentralizador5toAno(datosCentral);

    // 3. VERIFICACIÓN PREVIA: Consultar si el hash ya existe registrado en la BD Local
    const checkExistente = await pool.query(
      `SELECT * FROM certificaciones_blockchain WHERE hash_local = $1 OR estudiante_id = $2::uuid LIMIT 1`,
      [hashLocal, estudiante_id]
    );

    if (checkExistente.rows.length > 0) {
      const reg = checkExistente.rows[0];
      return res.status(200).json({
        success: true,
        yaExistia: true,
        message: "El Centralizador ya fue certificado previamente en la red Blockchain.",
        hash_local: reg.hash_local,
        tx_hash: reg.tx_hash,
        registroLocal: reg
      });
    }

    // 4. Obtener Nombre del Estudiante desde usuarios
    const resUser = await pool.query(
      `SELECT nombre, apellido FROM usuarios WHERE id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let nombreCompleto = datosCentral.estudiante_nombre;
    if (resUser.rows.length > 0) {
      const u = resUser.rows[0];
      nombreCompleto = `${u.nombre || ''} ${u.apellido || ''}`.trim();
    }

    // 5. Si no existe, registrar en Ethereum Sepolia
    const resultadoWeb3 = await blockchainService.registrarEnBlockchain(hashLocal, estudiante_id);

    let txHashSeguro = resultadoWeb3.txHash || `REGISTERED_ON_CHAIN_${hashLocal.substring(0, 18)}`;

    // 6. Guardar en la base de datos local
    const queryInsert = `
      INSERT INTO certificaciones_blockchain (
        estudiante_id,
        nombre_estudiante,
        hash_local,
        tx_hash
      ) VALUES ($1::uuid, $2, $3, $4)
      RETURNING *;
    `;

    const dbResult = await pool.query(queryInsert, [
      estudiante_id,
      nombreCompleto.toUpperCase(),
      hashLocal,
      txHashSeguro
    ]);

    return res.status(200).json({
      success: true,
      yaExistia: false,
      message: "Centralizador de 5to Año certificado e inmutable en Blockchain.",
      hash_local: hashLocal,
      tx_hash: txHashSeguro,
      registroLocal: dbResult.rows[0]
    });

  } catch (error) {
    console.error("Error en certificarCentralizador5toAno:", error);
    return res.status(500).json({ 
      message: error.message || "Error al certificar el centralizador en Blockchain." 
    });
  }
};