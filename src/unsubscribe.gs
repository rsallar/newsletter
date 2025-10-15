/**
 * Maneja la solicitud de desuscripción del usuario.
 * @param {Object} e - El objeto de evento de la solicitud GET.
 * @returns {HtmlService.HtmlOutput} Una página de confirmación para el usuario.
 */
function handleUnsubscribe(e) {
  let message;
  const newsletterId = e.parameter.newsletterId;
  const email = e.parameter.email;

  // Comprobamos que los parámetros necesarios existen.
  if (!newsletterId || !email) {
    message = 'La solicitud de desuscripción no es válida porque el enlace está incompleto. Por favor, utiliza el enlace original del correo.';
    console.error(`Intento de desuscripción fallido por falta de parámetros: ID=${newsletterId}, Email=${email}`);
  } else {
    try {
      // Llamamos a la función que desactiva el registro en la hoja de cálculo.
      unsubscribeRecipient(newsletterId, email);
      message = `Tu dirección de correo (${email}) ha sido dada de baja correctamente. No recibirás más comunicaciones de esta newsletter.`;
      console.log(`Desuscripción exitosa para ${email} de la newsletter ${newsletterId}.`);
    } catch (error) {
      // Si la función `unsubscribeRecipient` lanza un error (ej. no encuentra el email),
      // asumimos que ya no estaba suscrito.
      console.warn(`Intento de desuscripción para un correo no encontrado: ${email}. Error: ${error.message}`);
      message = `No hemos podido procesar tu solicitud. Es posible que tu correo (${email}) ya haya sido dado de baja anteriormente.`;
    }
  }

  // Preparamos la página de respuesta para el usuario.
  const template = HtmlService.createTemplateFromFile('src/web/unsubscribe.html');
  template.message = message; // Pasamos el mensaje a la plantilla.
  
  const htmlOutput = template.evaluate();
  htmlOutput.setTitle('Confirmación de Desuscripción');
  htmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  
  return htmlOutput;
}
