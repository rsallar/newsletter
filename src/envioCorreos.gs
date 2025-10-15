/**
 * Envía la newsletter a la lista de correos de una newsletter específica.
 * @param {string} contenidoNewsletter - El contenido HTML de la newsletter.
 * @param {Array<Object>} noticiasCompletas - La lista completa de noticias.
 * @param {string} newsletterId - El ID de la newsletter para buscar los destinatarios.
 * @returns {string} Un mensaje de resumen del proceso de envío.
 * @throws {Error} Si no se encuentran destinatarios o si todos los envíos fallan.
 */
function enviarNewsletter(contenidoNewsletter, noticiasCompletas, newsletterId) {
  // getRecipients ahora devuelve objetos {email, isEnabled, ...}
  const todosLosCorreos = getRecipients(newsletterId);
  
  // NUEVO: Filtrar solo los destinatarios que están activos.
  const correosActivos = todosLosCorreos
    .filter(r => r.isEnabled === true)
    .map(r => r.email);

  if (!correosActivos || correosActivos.length === 0) {
    throw new Error(`No se encontraron destinatarios activos. Revisa la lista de correos o añade nuevos destinatarios.`);
  }
  
  const asunto = "Tu Newsletter Semanal";
  let erroresDeEnvio = 0;
  let enviosExitosos = 0;
  
  const webAppUrl = ScriptApp.getService().getUrl();

  for (const correo of correosActivos) {
    try {
      const unsubscribeUrl = `${webAppUrl}?action=unsubscribe&newsletterId=${encodeURIComponent(newsletterId)}&email=${encodeURIComponent(correo)}`;
      const footerHtml = `<br><hr><p style="font-size: small; text-align: center; color: #888;">Si no deseas recibir más correos, puedes <a href="${unsubscribeUrl}" target="_blank">darte de baja aquí</a>.</p>`;
      const finalHtmlBody = contenidoNewsletter + footerHtml;
      
      MailApp.sendEmail({
        to: correo,
        subject: asunto,
        htmlBody: finalHtmlBody,
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
  
  if (enviosExitosos === 0 && erroresDeEnvio > 0) {
    throw new Error(`Fallo total en el envío. No se pudo enviar a ninguno de los ${erroresDeEnvio} destinatarios.`);
  }

  return `Envío completado. ${enviosExitosos} de ${correosActivos.length} correos enviados exitosamente.`;
}
