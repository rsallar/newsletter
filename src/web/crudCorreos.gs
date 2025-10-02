/**
 * Agrega un correo electrónico a la hoja 'Correos'.
 * @param {string} email El correo electrónico a agregar.
 * @returns {string} Mensaje de éxito.
 * @throws {Error} Si el correo no es válido o ya existe.
 */
function agregarCorreo(email) {
  if (!email || !email.includes('@')) {
    throw new Error("Por favor, introduce una dirección de correo válida.");
  }
  const spreadsheet = getProjectSpreadsheet();
  const sheet = getSheet(spreadsheet, 'Correos');
  
  // Si la hoja está vacía, añade una cabecera
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Email']);
  }
  
  const data = sheet.getDataRange().getValues();
  const isDuplicate = data.some(row => row[0].trim().toLowerCase() === email.trim().toLowerCase());
  
  if (isDuplicate) {
    throw new Error("El correo electrónico ya existe en la lista.");
  }

  sheet.appendRow([email]);
  return `Correo '${email}' agregado exitosamente.`;
}

/**
 * Obtiene todos los correos de la hoja 'Correos'.
 * @returns {Array<string>} Una lista de correos electrónicos.
 */
function obtenerCorreos() {
  const spreadsheet = getProjectSpreadsheet();
  const sheet = getSheet(spreadsheet, 'Correos');
  if (sheet.getLastRow() < 2) { // Menos de 2 porque la primera fila es la cabecera
    return [];
  }
  // getValues() devuelve [[email1], [email2]], .slice(1) omite la cabecera, .flat() lo convierte en [email1, email2]
  return sheet.getDataRange().getValues().slice(1).flat();
}

/**
 * Elimina un correo electrónico de la hoja 'Correos'.
 * @param {string} email El correo electrónico a eliminar.
 * @returns {string} Mensaje de éxito.
 * @throws {Error} Si no se encuentra el correo.
 */
function eliminarCorreo(email) {
  const spreadsheet = getProjectSpreadsheet();
  const sheet = getSheet(spreadsheet, 'Correos');
  const data = sheet.getDataRange().getValues();
  
  // Iteramos hacia atrás porque eliminar filas cambia los índices
  for (let i = data.length - 1; i > 0; i--) { // Empezamos en > 0 para saltar la cabecera
    if (data[i][0].trim().toLowerCase() === email.trim().toLowerCase()) {
      sheet.deleteRow(i + 1); // Las filas en Apps Script son 1-indexed
      return `Correo '${email}' eliminado exitosamente.`;
    }
  }
  throw new Error("No se encontró el correo para eliminar.");
}