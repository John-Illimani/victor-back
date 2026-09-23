import crypto from "crypto";

/**
 * Genera un Hash SHA-256 determinista basado en TODOS los campos del Centralizador de 3er Año.
 */
export const generarHashCentralizador3erAno = (datosCentralizador) => {
  const {
    estudiante_id,
    apellidos_nombres,
    esfm_ua,
    especialidad,
    nota_a1,
    nota_b1,
    nota_b2,
    nota_b3,
    nota_b4,
    nota_b5,
    promedio_numeral,
    promedio_literal,
    observaciones,
    lugar_ciudad,
    departamento,
    dia,
    mes,
    ano
  } = datosCentralizador;

  const parseNum = (val) => { const n = parseFloat(val); return isNaN(n) ? 0 : n; };

  const payloadString = JSON.stringify({
    estudiante_id: String(estudiante_id || '').trim(),
    apellidos_nombres: String(apellidos_nombres || '').trim().toUpperCase(),
    esfm_ua: String(esfm_ua || '').trim(),
    especialidad: String(especialidad || '').trim(),
    nota_a1: parseNum(nota_a1),
    nota_b1: parseNum(nota_b1),
    nota_b2: parseNum(nota_b2),
    nota_b3: parseNum(nota_b3),
    nota_b4: parseNum(nota_b4),
    nota_b5: parseNum(nota_b5),
    promedio_numeral: parseNum(promedio_numeral),
    promedio_literal: String(promedio_literal || '').trim().toUpperCase(),
    observaciones: String(observaciones || '').trim(),
    lugar_ciudad: String(lugar_ciudad || '').trim(),
    departamento: String(departamento || '').trim(),
    dia: String(dia || '').trim(),
    mes: String(mes || '').trim().toUpperCase(),
    ano: String(ano || '').trim().slice(0, 4)
  });

  return "0x" + crypto.createHash("sha256").update(payloadString).digest("hex");
};