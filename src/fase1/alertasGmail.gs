/**
 * Crea o actualiza un filtro en Gmail para las palabras clave.
 * Busca un filtro existente que aplique la etiqueta 'Newsletter-Alerts' y lo reemplaza.
 * @param {string[]} keywordsArray - Un array de palabras clave.
 */
function crearOActualizarFiltroGmail(keywordsArray) {
  // 1. Obtener o crear la etiqueta
  let label = GmailApp.getUserLabelByName('Newsletter-Alerts');
  if (!label) {
    label = GmailApp.createLabel('Newsletter-Alerts');
  }
  const labelId = label.getId();

  // 2. Buscar y eliminar el filtro antiguo usando el servicio avanzado de Gmail
  const filters = Gmail.Users.Settings.Filters.list('me').filter;
  if (filters && filters.length > 0) {
    for (const filter of filters) {
      const action = filter.action;
      // Buscamos un filtro que añada nuestra etiqueta específica
      if (action && action.addLabelIds && action.addLabelIds.includes(labelId)) {
        console.log(`Filtro existente encontrado con ID: ${filter.id}. Eliminándolo.`);
        Gmail.Users.Settings.Filters.remove('me', filter.id);
        // Asumimos que solo hay un filtro gestionado por este script.
        // Rompemos el bucle una vez encontrado y eliminado.
        break;
      }
    }
  }

  // 3. Crear el nuevo filtro
  const query = `from:(googlealerts-noreply@google.com) {${keywordsArray.join(' OR ')}}`;
  
  console.log(`Creando nuevo filtro con la query: "${query}" y la etiqueta ID: ${labelId}`);
  Gmail.Users.Settings.Filters.create({
    criteria: {
      query: query
    },
    action: {
      addLabelIds: [labelId],
      removeLabelIds: ['INBOX']
    }
  }, 'me');
}
