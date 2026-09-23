import crypto from "crypto";

/**
 * Genera un Hash SHA-256 determinista basado en los campos del Centralizador de 1er Año.
 */
export const generarHashCentralizador1erAno = (datosCentralizador) => {
  const {
    estudiante_id,
    apellidos_nombres,
    esfm_ua,
    especialidad,
    nota_f1,
    nota_f2,
    nota_f3,
    nota_f4,
    nota_f5,
    promedio_numeral,
    lugar_ciudad,
    departamento,
    dia,
    mes,
    ano
  } = datosCentralizador;

  const parseNum = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const payloadString = JSON.stringify({
    estudiante_id: String(estudiante_id || '').trim(),
    apellidos_nombres: String(apellidos_nombres || '').trim().toUpperCase(),
    esfm_ua: String(esfm_ua || '').trim(),
    especialidad: String(especialidad || '').trim(),
    nota_f1: parseNum(nota_f1),
    nota_f2: parseNum(nota_f2),
    nota_f3: parseNum(nota_f3),
    nota_f4: parseNum(nota_f4),
    nota_f5: parseNum(nota_f5),
    promedio_numeral: Math.round(parseNum(promedio_numeral)),
    lugar_ciudad: String(lugar_ciudad || '').trim(),
    departamento: String(departamento || '').trim(),
    dia: String(dia || '').trim(),
    mes: String(mes || '').trim().toUpperCase(),
    ano: String(ano || '').trim().slice(0, 4)
  });

  return "0x" + crypto.createHash("sha256").update(payloadString).digest("hex");
};