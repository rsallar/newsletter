/**
 * Incluye el contenido de otro archivo HTML dentro de la plantilla principal.
 * Se usa en el HTML con la sintaxis: <?!= include('path/to/file.html'); ?>
 * @param {string} filename La ruta del archivo a incluir.
 * @returns {string} El contenido del archivo.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}