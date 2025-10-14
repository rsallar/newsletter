/**
 * Sirve la página web cuando se accede a la URL del script.
 * Esta es la función principal que se ejecuta al cargar la aplicación web.
 * @param {Object} e El parámetro de evento para una solicitud de aplicación web.
 * @returns {HtmlService.HtmlOutput} La salida del servicio HTML.
 */
function doGet(e) {
  // Creamos la plantilla a partir del archivo HTML
  const htmlOutput = HtmlService.createTemplateFromFile('src/web/index').evaluate();
  
  // AÑADIMOS LA ETIQUETA VIEWPORT PROGRAMÁTICAMENTE
  // Esta es la forma más robusta de asegurar que se aplique.
  htmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1.0');

  // Configuramos el resto de las propiedades y devolvemos el resultado
  htmlOutput.setTitle('Configuración de Newsletter');
  htmlOutput.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  
  return htmlOutput;
}