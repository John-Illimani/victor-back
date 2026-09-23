import crypto from "crypto";

/**
 * Genera un Hash SHA-256 determinista a partir de los datos del Centralizador de 5to Año.
 */
export const generarHashCentralizador5toAno = (datosCentralizador) => {
  const {
    estudiante_id,
    especialidad,
    nota_a1,
    nota_b1,
    nota_b4,
    nota_b5,
    nota_b6,
    nota_c1,
    nota_c2,
    promedio_numeral
  } = datosCentralizador;

  const payloadString = JSON.stringify({
    estudiante_id: String(estudiante_id).trim(),
    especialidad: String(especialidad || '').trim(),
    nota_a1: Math.round(Number(nota_a1) || 0),
    nota_b1: Math.round(Number(nota_b1) || 0),
    nota_b4: Math.round(Number(nota_b4) || 0),
    nota_b5: Math.round(Number(nota_b5) || 0),
    nota_b6: Math.round(Number(nota_b6) || 0),
    nota_c1: Math.round(Number(nota_c1) || 0),
    nota_c2: Math.round(Number(nota_c2) || 0),
    promedio_numeral: Math.round(Number(promedio_numeral) || 0)
  });

  return "0x" + crypto.createHash("sha256").update(payloadString).digest("hex");
};