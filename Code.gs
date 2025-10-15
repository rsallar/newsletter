/**
 * Sirve la página web cuando se accede a la URL del script.
 * Esta es la función principal que se ejecuta al cargar la aplicación web.
 * @param {Object} e El parámetro de evento para una solicitud de aplicación web.
 * @returns {HtmlService.HtmlOutput} La salida del servicio HTML.
 */
function doGet(e) {
  console.log(`doGet ejecutado con parámetros: ${JSON.stringify(e.parameter)}`);

  // 1. Prioridad máxima: Acciones públicas que no requieren login.
  if (e && e.parameter && e.parameter.action === 'unsubscribe') {
    console.log("Acción pública 'unsubscribe' detectada. Procesando...");
    return handleUnsubscribe(e);
  }

  // 2. FIX: La autenticación ahora se basa en un token de sesión temporal.
  // Se comprueba si el usuario ha sido autenticado recientemente a través de la página de login.
  if (isUserAuthenticated()) {
    console.log("Usuario autenticado a través de token de sesión. Mostrando dashboard.");
    
    return HtmlService.createTemplateFromFile('src/web/index.html')
      .evaluate()
      .setTitle('Configuración de Newsletter')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  // 3. Si no hay un token de sesión válido, mostrar siempre la página de login.
  console.log("No autenticado. Mostrando página de login.");
  const loginTemplate = HtmlService.createTemplateFromFile('src/web/login.html');
  
  return loginTemplate.evaluate()
    .setTitle('Acceso Requerido')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
