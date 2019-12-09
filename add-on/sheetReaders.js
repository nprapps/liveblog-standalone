function readSheetAsObjects(id, name) {
  var book = SpreadsheetApp.openById(id);
  var sheet = book.getSheetByName(name);
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  var header = sheet.getSheetValues(1, 1, 1, lastColumn)[0];
  var rows = sheet.getSheetValues(2, 1, lastRow - 1, lastColumn);
  var parsed = header;
  var output = [];
  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    var obj = {};
    for (var c = 0; c < row.length; c++) {
      var prop = header[c];
      if (!prop) continue;
      var cell = row[c];
      obj[prop] = cell;
    }
    output.push(obj);
  }
  return output;
};