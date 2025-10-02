/**
 * Sirve la página web cuando se accede a la URL del script.
 * Esta es la función principal que se ejecuta al cargar la aplicación web.
 * @param {Object} e El parámetro de evento para una solicitud de aplicación web.
 * @returns {HtmlService.HtmlOutput} La salida del servicio HTML.
 */
function doGet(e) {
  // Cambiamos createHtmlOutputFromFile por createTemplateFromFile y añadimos .evaluate()
  // Esto le dice a Apps Script que procese cualquier código del lado del servidor (como <?!= ... ?>) en el HTML.
  return HtmlService.createTemplateFromFile('src/web/index')
      .evaluate() // Este es el paso crucial que ejecuta la función 'include'
      .setTitle('Configuración de Newsletter');
}
