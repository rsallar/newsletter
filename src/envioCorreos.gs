/**
 * Envía la newsletter a la lista de correos.
 * @param {string} contenidoNewsletter - El contenido HTML de la newsletter.
 * @param {Array<Object>} noticiasCompletas - La lista completa de noticias.
 */
function enviarNewsletter(contenidoNewsletter, noticiasCompletas) {
  const spreadsheet = getProjectSpreadsheet();
  const sheetCorreos = getSheet(spreadsheet, 'Correos');
  
  // Obtenemos todos los valores de la hoja.
  const allValues = sheetCorreos.getDataRange().getValues();

  // Si hay menos de 2 filas, significa que solo está la cabecera o está vacía.
  if (allValues.length < 2) {
    console.warn("La lista de correos está vacía (solo cabecera o ninguna fila). No se enviarán correos.");
    return; // Salimos de la función silenciosamente.
  }
  
  // Omitimos la primera fila (cabecera) con .slice(1).
  // Luego, aplanamos el array y filtramos para quedarnos solo con correos válidos.
  const correos = allValues
    .slice(1) // Elimina la fila de la cabecera ['Email']
    .flat()   // Convierte [['a@b.com'], ['c@d.com']] en ['a@b.com', 'c@d.com']
    .map(email => typeof email === 'string' ? email.trim() : '') // Asegura que sea string y quita espacios
    .filter(email => email && email.includes('@')); // Filtra correos vacíos o sin '@'
  
  if (correos.length === 0) {
    console.log("No se encontraron correos válidos en la lista después de filtrar. Finalizando envío.");
    return;
  }
  
  let htmlBody = contenidoNewsletter;
  /*htmlBody += "<h2>Todas las Noticias de la Semana:</h2><ul>";
  noticiasCompletas.forEach(noticia => {
    htmlBody += `<li><a href="${noticia.url}">${noticia.url}</a></li>`;
  });
  htmlBody += "</ul>";*/

  const asunto = "Tu Newsletter Semanal";
  let erroresDeEnvio = 0;
  
  for (const correo of correos) {
    try {
      MailApp.sendEmail({
        to: correo,
        subject: asunto,
        htmlBody: htmlBody,
      });
      console.log(`Newsletter enviada exitosamente a ${correo}`);
    } catch (e) {
      // Registramos el error para un correo específico pero continuamos con los demás.
      console.error(`ERROR al enviar correo a ${correo}. Motivo: ${e.message}`);
      erroresDeEnvio++;
    }
  }

  if (erroresDeEnvio > 0) {
      console.warn(`Proceso de envío finalizado con ${erroresDeEnvio} errores.`);
  }
}
