import crypto from "crypto";

/**
 * Genera un Hash SHA-256 determinista basado en los campos del Centralizador de 2do Año.
 */
export const generarHashCentralizador2doAno = (datosCentralizador) => {
  const {
    estudiante_id,
    apellidos_nombres,
    esfm_ua,
    ano_formacion,
    nota_f1,
    nota_f2,
    nota_f3,
    nota_f4,
    nota_f5,
    nota_f6,
    promedio_numeral,
    observaciones,
    lugar_ciudad,
    dia,
    mes,
    ano
  } = datosCentralizador;

  const parseNum = (val) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : Math.round(num);
  };

  const payloadString = JSON.stringify({
    estudiante_id: String(estudiante_id || '').trim(),
    apellidos_nombres: String(apellidos_nombres || '').trim().toUpperCase(),
    esfm_ua: String(esfm_ua || '').trim(),
    ano_formacion: String(ano_formacion || '').trim(),
    nota_f1: parseNum(nota_f1),
    nota_f2: parseNum(nota_f2),
    nota_f3: parseNum(nota_f3),
    nota_f4: parseNum(nota_f4),
    nota_f5: parseNum(nota_f5),
    nota_f6: parseNum(nota_f6),
    promedio_numeral: parseNum(promedio_numeral),
    observaciones: String(observaciones || '').trim(),
    lugar_ciudad: String(lugar_ciudad || '').trim(),
    dia: String(dia || '').trim(),
    mes: String(mes || '').trim().toLowerCase(),
    ano: String(ano || '').trim().slice(0, 4)
  });

  return "0x" + crypto.createHash("sha256").update(payloadString).digest("hex");
};