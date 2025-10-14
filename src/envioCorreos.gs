/**
 * Envía la newsletter a la lista de correos de una newsletter específica.
 * @param {string} contenidoNewsletter - El contenido HTML de la newsletter.
 * @param {Array<Object>} noticiasCompletas - La lista completa de noticias.
 * @param {string} newsletterId - El ID de la newsletter para buscar los destinatarios.
 * @returns {string} Un mensaje de resumen del proceso de envío.
 * @throws {Error} Si no se encuentran destinatarios o si todos los envíos fallan.
 */
function enviarNewsletter(contenidoNewsletter, noticiasCompletas, newsletterId) {
  const correos = getRecipients(newsletterId);
  
  if (!correos || correos.length === 0) {
    // Lanzar un error es la mejor forma de notificar al proceso que lo llama (manual o automático)
    // que algo fundamental falló y no se puede continuar.
    throw new Error(`No se encontraron destinatarios. Añade correos en la sección "Destinatarios" antes de enviar.`);
  }
  
  const asunto = "Tu Newsletter Semanal";
  let erroresDeEnvio = 0;
  let enviosExitosos = 0;
  
  for (const correo of correos) {
    try {
      MailApp.sendEmail({
        to: correo,
        subject: asunto,
        htmlBody: contenidoNewsletter,
      });
      console.log(`Newsletter enviada exitosamente a ${correo} (desde Newsletter ID: ${newsletterId})`);
      enviosExitosos++;
    } catch (e) {
      console.error(`ERROR al enviar correo a ${correo}. Motivo: ${e.message}`);
      erroresDeEnvio++;
    }
  }

  if (erroresDeEnvio > 0) {
      console.warn(`Proceso de envío para ${newsletterId} finalizado con ${erroresDeEnvio} errores.`);
  }
  
  // Si no se pudo enviar ningún correo, se considera un fallo total.
  if (enviosExitosos === 0 && erroresDeEnvio > 0) {
    throw new Error(`Fallo total en el envío. No se pudo enviar a ninguno de los ${erroresDeEnvio} destinatarios.`);
  }

  // Si todo fue bien o hubo fallos parciales, se devuelve un resumen.
  return `Envío completado. ${enviosExitosos} de ${correos.length} correos enviados exitosamente.`;
}
