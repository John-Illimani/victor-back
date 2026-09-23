import crypto from "crypto";

/**
 * Genera un Hash SHA-256 determinista a partir de los datos completos del Centralizador de 5to Año.
 * Cualquier cambio en las notas, nombres o datos modificará el hash resultante.
 */
export const generarHashCentralizador5toAno = (datosCentralizador) => {
  const {
    estudiante_id,
    estudiante_nombre,
    apellidos_nombres,
    ci,
    carnet,
    especialidad,
    docente_tutor_nombre,
    docente_tutor_id,
    nota_a1,
    nota_b1,
    nota_b4,
    nota_b5,
    nota_b6,
    promedio_final_1,
    nota_c1,
    nota_c2,
    promedio_final_2,
    promedio_numeral,
    lugar_ciudad,
    dia,
    mes,
    ano
  } = datosCentralizador;

  const payloadString = JSON.stringify({
    estudiante_id: String(estudiante_id || '').trim(),
    estudiante_nombre: String(estudiante_nombre || apellidos_nombres || '').trim(),
    ci: String(ci || carnet || '').trim(),
    especialidad: String(especialidad || '').trim(),
    docente_tutor: String(docente_tutor_nombre || docente_tutor_id || '').trim(),
    nota_a1: Math.round(Number(nota_a1) || 0),
    nota_b1: Math.round(Number(nota_b1) || 0),
    nota_b4: Math.round(Number(nota_b4) || 0),
    nota_b5: Math.round(Number(nota_b5) || 0),
    nota_b6: Math.round(Number(nota_b6) || 0),
    promedio_final_1: Math.round(Number(promedio_final_1) || 0),
    nota_c1: Math.round(Number(nota_c1) || 0),
    nota_c2: Math.round(Number(nota_c2) || 0),
    promedio_final_2: Math.round(Number(promedio_final_2) || 0),
    promedio_numeral: Math.round(Number(promedio_numeral) || 0),
    lugar_ciudad: String(lugar_ciudad || '').trim(),
    dia: String(dia || '').trim(),
    mes: String(mes || '').trim(),
    ano: String(ano || '').trim()
  });

  return "0x" + crypto.createHash("sha256").update(payloadString).digest("hex");
};