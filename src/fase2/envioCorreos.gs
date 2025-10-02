/**
 * Envía la newsletter a la lista de correos.
 * @param {string} contenidoNewsletter - El contenido HTML de la newsletter.
 * @param {Array<Object>} noticiasCompletas - La lista completa de noticias.
 */
function enviarNewsletter(contenidoNewsletter, noticiasCompletas) {
  const spreadsheet = getProjectSpreadsheet();
  // Usamos la nueva función de utilidad para obtener/crear la hoja
  const sheetCorreos = getSheet(spreadsheet, 'Correos');
  
  if (sheetCorreos.getLastRow() < 1) {
    console.log("No hay correos a los que enviar la newsletter. Finalizando envío.");
    return;
  }
  
  const correos = sheetCorreos.getDataRange().getValues().flat();
  
  let htmlBody = contenidoNewsletter;
  htmlBody += "<h2>Todas las Noticias de la Semana:</h2><ul>";
  noticiasCompletas.forEach(noticia => {
    htmlBody += `<li><a href="${noticia.url}">${noticia.url}</a></li>`;
  });
  htmlBody += "</ul>";

  const asunto = "Tu Newsletter Semanal";
  
  for (const correo of correos) {
    MailApp.sendEmail({
      to: correo,
      subject: asunto,
      htmlBody: htmlBody,
    });
  }
}
