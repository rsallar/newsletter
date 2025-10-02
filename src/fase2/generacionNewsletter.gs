/**
 * Genera el contenido de la newsletter utilizando Gemini.
 */
function generarNewsletter() {
  // Obtenemos la hoja de cálculo a través de nuestra función de utilidad
  const spreadsheet = getProjectSpreadsheet();
  const sheet = spreadsheet.getSheetByName('Contenido');

  // Validar si la hoja de contenido existe o está vacía
  if (!sheet || sheet.getLastRow() < 2) { // < 2 porque la primera fila puede ser la cabecera
    console.log("No hay contenido para generar la newsletter. Finalizando.");
    return;
  }
  
  const datos = sheet.getDataRange().getValues();
  
  // Preparar los datos para Gemini
  const noticiasDeLaSemana = datos.slice(1).map(fila => ({ url: fila[1], resumen: fila[2] }));

  // Llamar a Gemini para generar el análisis y seleccionar los 5 más relevantes
  const contenidoNewsletter = generarContenidoNewsletterConGemini(noticiasDeLaSemana);

  // Enviar la newsletter
  enviarNewsletter(contenidoNewsletter, noticiasDeLaSemana);
}
