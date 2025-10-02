/**
 * Accede a los correos de alertas no leídos, extrae las URLs y las guarda en una hoja de cálculo.
 */
function recopilarContenido() {
  const label = GmailApp.getUserLabelByName('Newsletter-Alerts');
  if (!label) {
    console.log("La etiqueta 'Newsletter-Alerts' no existe. Deteniendo la recopilación.");
    return;
  }
  
  const threads = label.getThreads(0, 50);
  
  const spreadsheet = getProjectSpreadsheet();
  // Usamos la nueva función de utilidad para obtener/crear la hoja
  const sheet = getSheet(spreadsheet, 'Contenido');
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Fecha', 'URL', 'Resumen']);
  }
  
  for (const thread of threads) {
    if (thread.isUnread()) {
      const message = thread.getMessages()[0];
      const body = message.getPlainBody();
      
      const urlRegex = /https:\/\/www\.google\.com\/url\?q=(https?:\/\/[^&]+)/g;
      let match;
      while ((match = urlRegex.exec(body)) !== null) {
        const url = decodeURIComponent(match[1]);
        const resumen = resumirContenidoConGemini(url);
        
        guardarEnSpreadsheet(sheet, [new Date(), url, resumen]);
      }
      thread.markRead();
    }
  }
}
