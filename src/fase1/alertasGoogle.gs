/**
 * Genera un mensaje con instrucciones para que el usuario cree manualmente
 * las Alertas de Google, ya que no es posible automatizarlo de forma nativa.
 * @param {string[]} keywordsArray - Un array de palabras clave.
 * @returns {string} Un string con formato HTML que contiene las instrucciones.
 */
function crearAlertaGoogle(keywordsArray) {
  const keywordsString = keywordsArray.join('", "');
  
  const instructions = `
    <br><br><strong>ACCIÓN MANUAL REQUERIDA:</strong><br>
    La creación automática de Alertas de Google no es posible. Por favor, crea las alertas manualmente:
    <ol>
      <li>Ve a <a href="https://www.google.com/alerts" target="_blank" rel="noopener noreferrer">https://www.google.com/alerts</a>.</li>
      <li>Crea una alerta para cada una de tus palabras clave: "<strong>${keywordsString}</strong>".</li>
      <li>En "Mostrar opciones", asegúrate de que la opción "Enviar a" esté configurada con tu dirección de correo electrónico.</li>
      <li>La frecuencia "Una vez al día" es recomendada.</li>
    </ol>
    <p>El filtro de Gmail que hemos creado se encargará de organizar estos correos automáticamente en la etiqueta correcta.</p>
  `;
  
  return instructions;
}
