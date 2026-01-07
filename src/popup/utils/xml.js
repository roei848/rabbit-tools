export function parseXmlOrThrow(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("Invalid XML");
  }

  return xmlDoc;
}

export function serializeXml(xmlDoc) {
  const serializer = new XMLSerializer();
  return serializer.serializeToString(xmlDoc);
}

export function minifyXml(xmlString) {
  const xmlDoc = parseXmlOrThrow(xmlString);
  return serializeXml(xmlDoc).replace(/>\s+</g, "><");
}

export function formatXml(xmlString, indentSize = 2) {
  const xmlDoc = parseXmlOrThrow(xmlString);
  const raw = serializeXml(xmlDoc);

  let formatted = "";
  let indent = "";
  const tab = " ".repeat(indentSize);

  raw.split(/>\s*</).forEach((node) => {
    if (node.match(/^\/\w/)) indent = indent.substring(tab.length);
    formatted += `${indent}<${node}>\r\n`;
    if (node.match(/^<?\w[^>]*[^\/]$/)) indent += tab;
  });

  return formatted.substring(1, formatted.length - 3);
}


