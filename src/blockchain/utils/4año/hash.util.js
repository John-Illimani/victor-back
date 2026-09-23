import crypto from "crypto";

/**
 * Genera un Hash SHA-256 determinista basado en TODOS los campos del Centralizador de 4to Año.
 */
export const generarHashCentralizador4toAno = (datosCentralizador) => {
  const {
    estudiante_id,
    docente_tutor_id,
    integrante_ectg,
    especialidad,
    nota_a1,
    nota_a2,
    nota_b1,
    nota_b4,
    nota_b5,
    nota_b6,
    nota_b7,
    nota_c1,
    nota_c2,
    promedio_numeral,
    promedio_literal,
    lugar_ciudad,
    departamento,
    dia,
    mes,
    ano,
    estado
  } = datosCentralizador;

  const parseNum = (val) => { const n = parseFloat(val); return isNaN(n) ? 0 : n; };

  const payloadString = JSON.stringify({
    estudiante_id: String(estudiante_id || '').trim(),
    docente_tutor_id: String(docente_tutor_id || '').trim(),
    integrante_ectg: String(integrante_ectg || '').trim(),
    especialidad: String(especialidad || '').trim(),
    nota_a1: parseNum(nota_a1),
    nota_a2: parseNum(nota_a2),
    nota_b1: parseNum(nota_b1),
    nota_b4: parseNum(nota_b4),
    nota_b5: parseNum(nota_b5),
    nota_b6: parseNum(nota_b6),
    nota_b7: parseNum(nota_b7),
    nota_c1: parseNum(nota_c1),
    nota_c2: parseNum(nota_c2),
    promedio_numeral: parseNum(promedio_numeral),
    promedio_literal: String(promedio_literal || '').trim().toUpperCase(),
    lugar_ciudad: String(lugar_ciudad || '').trim(),
    departamento: String(departamento || '').trim(),
    dia: String(dia || '').trim(),
    mes: String(mes || '').trim().toUpperCase(),
    ano: String(ano || '').trim().slice(0, 4),
    estado: String(estado || '').trim().toUpperCase()
  });

  return "0x" + crypto.createHash("sha256").update(payloadString).digest("hex");
};