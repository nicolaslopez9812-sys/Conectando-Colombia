# Google Sheets Setup

1. Crea una hoja de cálculo en Google Sheets.
2. Cambia el nombre de la primera pestaña a `Donaciones`.
3. En la fila 1 usa estas columnas:

```text
id | fecha | nombre | email | telefono | tipo | tipoTexto | colegio | colegioTexto | dispositivos | cantidad | ciudad
```

4. Abre `Extensiones > Apps Script`.
5. Reemplaza el contenido por este script:

```javascript
const SHEET_NAME = 'Donaciones';

function doGet(e) {
  const action = (e.parameter.action || '').toLowerCase();

  if (action === 'list') {
    return jsonResponse({
      ok: true,
      data: getRecords()
    });
  }

  return jsonResponse({
    ok: false,
    message: 'Acción GET no soportada.'
  });
}

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || '{}');
  const action = (payload.action || '').toLowerCase();

  if (action === 'create') {
    const created = createRecord(payload.data || {});
    return jsonResponse({ ok: true, data: created });
  }

  if (action === 'delete') {
    deleteRecord(payload.id);
    return jsonResponse({ ok: true });
  }

  if (action === 'clear') {
    clearRecords();
    return jsonResponse({ ok: true });
  }

  return jsonResponse({
    ok: false,
    message: 'Acción POST no soportada.'
  });
}

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
}

function getRecords() {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  const headers = values.shift() || [];

  return values
    .filter(row => row.some(cell => cell !== ''))
    .map(row => {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = row[index];
      });
      return item;
    })
    .reverse();
}

function createRecord(data) {
  const sheet = getSheet();
  const record = {
    id: String(Date.now()),
    fecha: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'),
    nombre: data.nombre || '',
    email: data.email || '',
    telefono: data.telefono || '',
    tipo: data.tipo || '',
    tipoTexto: data.tipoTexto || '',
    colegio: data.colegio || '',
    colegioTexto: data.colegioTexto || '',
    dispositivos: data.dispositivos || '',
    cantidad: data.cantidad || '',
    ciudad: data.ciudad || ''
  };

  sheet.appendRow([
    record.id,
    record.fecha,
    record.nombre,
    record.email,
    record.telefono,
    record.tipo,
    record.tipoTexto,
    record.colegio,
    record.colegioTexto,
    record.dispositivos,
    record.cantidad,
    record.ciudad
  ]);

  return record;
}

function deleteRecord(id) {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();

  for (let i = values.length - 1; i >= 1; i -= 1) {
    if (String(values[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return;
    }
  }

  throw new Error('No se encontró el registro a eliminar.');
}

function clearRecords() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
```

6. Ve a `Implementar > Nueva implementación`.
7. Elige `Aplicación web`.
8. Configura:
   - Ejecutar como: `Tú`
   - Quién tiene acceso: `Cualquier persona`
9. Copia la URL de la implementación.
10. Abre [js/config.js](C:/Users/nicol_k/OneDrive/Desktop/Conectando%20a%20colombia%20con%20tecnologia/js/config.js) y reemplaza:

```javascript
window.APP_CONFIG = {
  googleAppsScriptUrl: 'PEGA_AQUI_LA_URL'
};
```

11. Guarda y vuelve a publicar tu sitio.

Con eso:
- El formulario de donación guardará en Google Sheets.
- El panel [pages/admin.html](C:/Users/nicol_k/OneDrive/Desktop/Conectando%20a%20colombia%20con%20tecnologia/pages/admin.html) leerá, exportará y podrá eliminar registros desde la hoja.
