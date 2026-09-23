import { pool } from "../database/database.js";
import { blockchainService } from "../blockchain/services/blockchain.service.js";

// IMPORTACIÓN DE UTILITARIOS DE HASH POR AÑO
import { generarHashCentralizador4toAno } from "../blockchain/utils/4año/hash.util.js";
import { generarHashCentralizador5toAno } from "../blockchain/utils/5año/hash.util.js";
import { generarHashCentralizador3erAno } from "../blockchain/utils/3año/hash.util.js";
import { generarHashCentralizador2doAno } from "../blockchain/utils/2año/hash.util.js";
import { generarHashCentralizador1erAno } from "../blockchain/utils/1año/hash.util.js";


// =========================================================================
// 1. POST - CERTIFICAR CENTRALIZADOR DE 4TO AÑO
// =========================================================================
export const certificarCentralizador4toAno = async (req, res) => {
  const { estudiante_id } = req.body;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    // 1. Obtener datos del Centralizador de 4to Año
    const resCentral = await pool.query(
      `SELECT * FROM centralizador_4to_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (resCentral.rowCount === 0) {
      return res.status(404).json({ message: "No se encontraron datos del centralizador de 4to año para certificar." });
    }

    const datosCentral = resCentral.rows[0];

    // 2. Generar Hash Criptográfico Local de 4to Año
    const hashLocal = generarHashCentralizador4toAno(datosCentral);

    // 3. Verificación Previa Local en BD
    const checkExistente = await pool.query(
      `SELECT * FROM certificaciones_blockchain WHERE hash_local = $1 ORDER BY fecha_registro DESC LIMIT 1`,
      [hashLocal]
    );

    if (checkExistente.rows.length > 0) {
      const reg = checkExistente.rows[0];
      return res.status(200).json({
        success: true,
        yaExistia: true,
        message: "El Centralizador de 4to Año cuenta con certificación vigente sin cambios detectados.",
        hash_local: reg.hash_local,
        tx_hash: reg.tx_hash,
        registroLocal: reg
      });
    }

    // 4. Nombre Completo
    let nombreCompleto = datosCentral.integrante_ectg;
    if (!nombreCompleto) {
      const resUser = await pool.query(
        `SELECT nombre, apellido FROM usuarios WHERE id = $1::uuid LIMIT 1`,
        [estudiante_id]
      );
      if (resUser.rows.length > 0) {
        const u = resUser.rows[0];
        nombreCompleto = `${u.nombre || ''} ${u.apellido || ''}`.trim();
      }
    }

    // 5. Minado/Registro Web3 en Ethereum Sepolia
    const resultadoWeb3 = await blockchainService.registrarEnBlockchain(hashLocal, estudiante_id);
    let txHashSeguro = resultadoWeb3.txHash || `REGISTERED_ON_CHAIN_${hashLocal.substring(0, 18)}`;

    // 6. Insertar en Certificaciones
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
      (nombreCompleto || "ESTUDIANTE 4TO AÑO").toUpperCase(),
      hashLocal,
      txHashSeguro
    ]);

    return res.status(200).json({
      success: true,
      yaExistia: false,
      message: "Se ha certificado de forma inmutable el Centralizador de 4to Año.",
      hash_local: hashLocal,
      tx_hash: txHashSeguro,
      registroLocal: dbResult.rows[0]
    });

  } catch (error) {
    console.error("Error en certificarCentralizador4toAno:", error);
    return res.status(500).json({ 
      message: error.message || "Error al certificar el centralizador de 4to año en Blockchain." 
    });
  }
};

// =========================================================================
// 2. POST - CERTIFICAR CENTRALIZADOR DE 5TO AÑO CON VERIFICACIÓN PREVIA LOCAL
// =========================================================================
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

    // 2. Generar Hash Criptográfico Local (SHA-256) de 5to Año
    const hashLocal = generarHashCentralizador5toAno(datosCentral);

    // 3. VERIFICACIÓN PREVIA LOCAL: Consultar SI EL HASH EXACTO ya existe en la BD
    const checkExistente = await pool.query(
      `SELECT * FROM certificaciones_blockchain WHERE hash_local = $1 ORDER BY fecha_registro DESC LIMIT 1`,
      [hashLocal]
    );

    // SI NO HAY CAMBIOS: Se reutiliza el registro y TX Hash original
    if (checkExistente.rows.length > 0) {
      const reg = checkExistente.rows[0];
      return res.status(200).json({
        success: true,
        yaExistia: true,
        message: "El documento cuenta con certificación inmutable vigente sin cambios detectados.",
        hash_local: reg.hash_local,
        tx_hash: reg.tx_hash,
        registroLocal: reg
      });
    }

    // SI HUBIERON CAMBIOS O ES PRIMERA VEZ: Se procede a una nueva emisión
    const resUser = await pool.query(
      `SELECT nombre, apellido FROM usuarios WHERE id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    let nombreCompleto = datosCentral.estudiante_nombre;
    if (resUser.rows.length > 0) {
      const u = resUser.rows[0];
      nombreCompleto = `${u.nombre || ''} ${u.apellido || ''}`.trim();
    }

    // 4. Registrar en Ethereum Sepolia la nueva versión
    const resultadoWeb3 = await blockchainService.registrarEnBlockchain(hashLocal, estudiante_id);

    let txHashSeguro = resultadoWeb3.txHash || `REGISTERED_ON_CHAIN_${hashLocal.substring(0, 18)}`;

    // 5. Guardar la nueva certificación vinculada al nuevo hash local
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
      message: "Se ha certificado de forma inmutable una nueva versión del Centralizador por modificación de datos.",
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

// =========================================================================
// 3. GET - VERIFICACIÓN PÚBLICA DE CERTIFICACIÓN POR HASH O ESTUDIANTE_ID
// =========================================================================
export const verificarCertificacionPublica = async (req, res) => {
  try {
    const { hash } = req.query;

    if (!hash) {
      return res.status(400).json({ message: "Hash o ID no proporcionado." });
    }

    const hashLimpio = hash.trim();

    const queryBD = `
      SELECT 
        cb.hash_local,
        cb.tx_hash,
        cb.fecha_registro,
        cb.estudiante_id,
        cb.nombre_estudiante,
        u.ci,
        u.especialidad
      FROM certificaciones_blockchain cb
      LEFT JOIN usuarios u ON cb.estudiante_id = u.id
      WHERE cb.hash_local = $1 OR cb.tx_hash = $1 OR cb.estudiante_id::text = $1
      ORDER BY cb.fecha_registro DESC
      LIMIT 1;
    `;

    const dbResult = await pool.query(queryBD, [hashLimpio]);

    if (dbResult.rows.length > 0) {
      const registro = dbResult.rows[0];
      return res.status(200).json({
        existe: true,
        autentico: true,
        estatus: "Centralizador Oficial Verificado e Inmutable en Blockchain",
        hash_local: registro.hash_local,
        tx_hash: registro.tx_hash,
        estudiante_id: registro.estudiante_id,
        nombre_estudiante: registro.nombre_estudiante,
        ci: registro.ci || 'S/C',
        especialidad: registro.especialidad || 'Sin Especialidad',
        fecha: Math.floor(new Date(registro.fecha_registro).getTime() / 1000),
        contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS
      });
    }

    const verificacionWeb3 = await blockchainService.verificarEnBlockchain(hashLimpio);

    if (verificacionWeb3.esValido) {
      return res.status(200).json({
        existe: true,
        autentico: true,
        estatus: "Documento Verificado en Smart Contract (Ethereum Sepolia)",
        hash_local: hashLimpio,
        tx_hash: "VERIFIED_ON_CHAIN",
        estudiante_id: verificacionWeb3.estudianteId,
        nombre_estudiante: `ESTUDIANTE ID: ${verificacionWeb3.estudianteId}`,
        fecha: Math.floor(new Date(verificacionWeb3.fechaRegistro).getTime() / 1000),
        contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS
      });
    } else {
      return res.status(404).json({
        existe: false,
        autentico: false,
        estatus: "ALERTA: El documento no figura en la red o ha sido alterado/modificado."
      });
    }

  } catch (error) {
    console.error("Error en verificarCertificacionPublica:", error);
    return res.status(500).json({ message: error.message });
  }
};



// =========================================================================
// POST - CERTIFICAR CENTRALIZADOR DE 3ER AÑO
// =========================================================================
export const certificarCentralizador3erAno = async (req, res) => {
  const { estudiante_id } = req.body;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    // 1. Consultar datos de la tabla de 3er año
    const resCentral = await pool.query(
      `SELECT * FROM centralizador_3er_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (resCentral.rowCount === 0) {
      return res.status(404).json({ message: "No se encontraron datos del centralizador de 3er año para certificar." });
    }

    const datosCentral = resCentral.rows[0];

    // 2. Generar Hash Criptográfico
    const hashLocal = generarHashCentralizador3erAno(datosCentral);

    // 3. Verificar si el Hash local ya existe
    const checkExistente = await pool.query(
      `SELECT * FROM certificaciones_blockchain WHERE hash_local = $1 ORDER BY fecha_registro DESC LIMIT 1`,
      [hashLocal]
    );

    if (checkExistente.rows.length > 0) {
      const reg = checkExistente.rows[0];
      return res.status(200).json({
        success: true,
        yaExistia: true,
        message: "El Centralizador de 3er Año cuenta con certificación vigente sin cambios detectados.",
        hash_local: reg.hash_local,
        tx_hash: reg.tx_hash,
        registroLocal: reg
      });
    }

    // 4. Obtener nombre completo
    let nombreCompleto = datosCentral.apellidos_nombres;
    if (!nombreCompleto) {
      const resUser = await pool.query(
        `SELECT nombre, apellido FROM usuarios WHERE id = $1::uuid LIMIT 1`,
        [estudiante_id]
      );
      if (resUser.rows.length > 0) {
        const u = resUser.rows[0];
        nombreCompleto = `${u.nombre || ''} ${u.apellido || ''}`.trim();
      }
    }

    // 5. Minado/Registro Web3 en Ethereum Sepolia
    const resultadoWeb3 = await blockchainService.registrarEnBlockchain(hashLocal, estudiante_id);
    let txHashSeguro = resultadoWeb3.txHash || `REGISTERED_ON_CHAIN_${hashLocal.substring(0, 18)}`;

    // 6. Guardar la nueva certificación
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
      (nombreCompleto || "ESTUDIANTE 3ER AÑO").toUpperCase(),
      hashLocal,
      txHashSeguro
    ]);

    return res.status(200).json({
      success: true,
      yaExistia: false,
      message: "Se ha certificado de forma inmutable el Centralizador de 3er Año.",
      hash_local: hashLocal,
      tx_hash: txHashSeguro,
      registroLocal: dbResult.rows[0]
    });

  } catch (error) {
    console.error("Error en certificarCentralizador3erAno:", error);
    return res.status(500).json({ 
      message: error.message || "Error al certificar el centralizador de 3er año en Blockchain." 
    });
  }
};





// =========================================================================
// POST - CERTIFICAR CENTRALIZADOR DE 2DO AÑO
// =========================================================================
export const certificarCentralizador2doAno = async (req, res) => {
  const { estudiante_id } = req.body;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    // 1. Obtener registro de 2do Año
    const resCentral = await pool.query(
      `SELECT * FROM centralizador_2do_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (resCentral.rowCount === 0) {
      return res.status(404).json({ message: "No se encontraron datos del centralizador de 2do año para certificar." });
    }

    const datosCentral = resCentral.rows[0];

    // 2. Generar Hash Local
    const hashLocal = generarHashCentralizador2doAno(datosCentral);

    // 3. Verificación Previa Local
    const checkExistente = await pool.query(
      `SELECT * FROM certificaciones_blockchain WHERE hash_local = $1 ORDER BY fecha_registro DESC LIMIT 1`,
      [hashLocal]
    );

    if (checkExistente.rows.length > 0) {
      const reg = checkExistente.rows[0];
      return res.status(200).json({
        success: true,
        yaExistia: true,
        message: "El Centralizador de 2do Año cuenta con certificación vigente sin cambios detectados.",
        hash_local: reg.hash_local,
        tx_hash: reg.tx_hash,
        registroLocal: reg
      });
    }

    // 4. Obtener nombre del estudiante
    let nombreCompleto = datosCentral.apellidos_nombres;
    if (!nombreCompleto) {
      const resUser = await pool.query(
        `SELECT nombre, apellido FROM usuarios WHERE id = $1::uuid LIMIT 1`,
        [estudiante_id]
      );
      if (resUser.rows.length > 0) {
        const u = resUser.rows[0];
        nombreCompleto = `${u.nombre || ''} ${u.apellido || ''}`.trim();
      }
    }

    // 5. Minado/Registro Web3 en Blockchain
    const resultadoWeb3 = await blockchainService.registrarEnBlockchain(hashLocal, estudiante_id);
    let txHashSeguro = resultadoWeb3.txHash || `REGISTERED_ON_CHAIN_${hashLocal.substring(0, 18)}`;

    // 6. Guardar Certificación
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
      (nombreCompleto || "ESTUDIANTE 2DO AÑO").toUpperCase(),
      hashLocal,
      txHashSeguro
    ]);

    return res.status(200).json({
      success: true,
      yaExistia: false,
      message: "Se ha certificado de forma inmutable el Centralizador de 2do Año.",
      hash_local: hashLocal,
      tx_hash: txHashSeguro,
      registroLocal: dbResult.rows[0]
    });

  } catch (error) {
    console.error("Error en certificarCentralizador2doAno:", error);
    return res.status(500).json({ 
      message: error.message || "Error al certificar el centralizador de 2do año en Blockchain." 
    });
  }
};






// =========================================================================
// POST - CERTIFICAR CENTRALIZADOR DE 1ER AÑO
// =========================================================================
export const certificarCentralizador1erAno = async (req, res) => {
  const { estudiante_id } = req.body;

  if (!estudiante_id) {
    return res.status(400).json({ message: "Se requiere un ID de estudiante válido." });
  }

  try {
    // 1. Obtener datos del Centralizador de 1er Año
    const resCentral = await pool.query(
      `SELECT * FROM centralizador_1er_ano_2026 WHERE estudiante_id = $1::uuid LIMIT 1`,
      [estudiante_id]
    );

    if (resCentral.rowCount === 0) {
      return res.status(404).json({ message: "No se encontraron datos del centralizador de 1er año para certificar." });
    }

    const datosCentral = resCentral.rows[0];

    // 2. Generar Hash Criptográfico Local de 1er Año
    const hashLocal = generarHashCentralizador1erAno(datosCentral);

    // 3. Verificación Previa Local en BD
    const checkExistente = await pool.query(
      `SELECT * FROM certificaciones_blockchain WHERE hash_local = $1 ORDER BY fecha_registro DESC LIMIT 1`,
      [hashLocal]
    );

    if (checkExistente.rows.length > 0) {
      const reg = checkExistente.rows[0];
      return res.status(200).json({
        success: true,
        yaExistia: true,
        message: "El Centralizador de 1er Año cuenta con certificación vigente sin cambios detectados.",
        hash_local: reg.hash_local,
        tx_hash: reg.tx_hash,
        registroLocal: reg
      });
    }

    // 4. Obtener nombre del estudiante
    let nombreCompleto = datosCentral.apellidos_nombres;
    if (!nombreCompleto) {
      const resUser = await pool.query(
        `SELECT nombre, apellido FROM usuarios WHERE id = $1::uuid LIMIT 1`,
        [estudiante_id]
      );
      if (resUser.rows.length > 0) {
        const u = resUser.rows[0];
        nombreCompleto = `${u.nombre || ''} ${u.apellido || ''}`.trim();
      }
    }

    // 5. Minado/Registro Web3 en Ethereum Sepolia
    const resultadoWeb3 = await blockchainService.registrarEnBlockchain(hashLocal, estudiante_id);
    let txHashSeguro = resultadoWeb3.txHash || `REGISTERED_ON_CHAIN_${hashLocal.substring(0, 18)}`;

    // 6. Guardar la certificación
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
      (nombreCompleto || "ESTUDIANTE 1ER AÑO").toUpperCase(),
      hashLocal,
      txHashSeguro
    ]);

    return res.status(200).json({
      success: true,
      yaExistia: false,
      message: "Se ha certificado de forma inmutable el Centralizador de 1er Año.",
      hash_local: hashLocal,
      tx_hash: txHashSeguro,
      registroLocal: dbResult.rows[0]
    });

  } catch (error) {
    console.error("Error en certificarCentralizador1erAno:", error);
    return res.status(500).json({ 
      message: error.message || "Error al certificar el centralizador de 1er año en Blockchain." 
    });
  }
};