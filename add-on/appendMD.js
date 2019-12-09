// pass in a document body and a string/array representation of Markdown to add that text to the document
// supports * for bold, _ for italic, # for headings, and basic link syntax.
function appendMD(root, lines) {
  if (typeof lines == "string") {
    lines = lines.split("\n");
  }
  // Logger.log(lines);
  return lines.map(function(line) {
    if (line.match(/^[-=+]{3,}$/)) {
      return root.appendHorizontalRule();
    }
    var extractHeading = line.match(/^(#+)?\s*(.*)/);
    var headerCode = extractHeading[1];
    var rest = extractHeading[2];
    var pStyle = DocumentApp.ParagraphHeading.NORMAL;
    if (headerCode) {
      pStyle = DocumentApp.ParagraphHeading["HEADING" + headerCode.length];
    }
    
    // parse into tokens
    var buffer = "";
    var parsed = [];
    var escaping = false;
    for (var i = 0; i < rest.length; i++) {
      var char = rest[i];
      switch (char) {
        case "*":
        case "_":
          if (buffer) parsed.push({ text: buffer });
          buffer = "";
          parsed.push({ mark: char });
        break;
            
        case "\\":
          buffer += rest[++i];
        break;
            
        case "[":
          var remainder = rest.slice(i + 1);
          var match = remainder.match(/^([^\]]+)\]\(([^)]+)\)/);
          if (match) {
            var all = match[0];
            var text = match[1];
            var url = match[2];
            if (buffer) parsed.push({ text: buffer });
            buffer = "";
            parsed.push({
              type: "link",
              text: text,
              url: url
            });
            i += all.length;
            break;
          }
            
        default:
          buffer += char;
      }
    }
    if (buffer) parsed.push({ text: buffer });
    
    // take the parsed text and generate a paragraph
    var textContent = parsed
      .map(function(token) { return token.text })
      .filter(function(d) { return d })
      .join("");
    var paragraph = root.appendParagraph(textContent);
    paragraph.setHeading(pStyle);
    
    var textObject = paragraph.editAsText();
    var offset = 0;
    var marks = {};
    parsed.forEach(function(token) {
      if (token.mark) {
        if (token.mark in marks) {
          var start = marks[token.mark];
          var methods = {
            "*": "setBold",
            "_": "setItalic"
          };
          var setter = methods[token.mark];
          textObject[setter](start, offset - 1, true);
          delete marks[token.mark];
        } else {
          marks[token.mark] = offset;
        }
      }
      
      if (token.url) {
        textObject.setLinkUrl(offset, offset + token.text.length - 1, token.url);
      }
      
      if (token.text) {
        offset += token.text.length;
      }
    });
    
    return paragraph;
    
  });
}