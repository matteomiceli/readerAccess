export function getContentByTag(xml: Document, tagName: string) {
  return xml.getElementsByTagName(tagName)?.[0]?.innerHTML;
}

export function getAttributeValueByName(
  xml: Document,
  tagName: string,
  attributeName: string
) {
  return Object.values(xml.getElementsByTagName(tagName)?.[0].attributes).find(
    (attr) => attr.name === attributeName
  )?.value;
}

export function getEpubCoverPath(xml: Document) {
  const coverTag = xml.getElementsByName("cover")?.[0];

  if (!coverTag) {
    return;
  }

  // Manifest ID
  const coverId = Object.values(coverTag.attributes).find(
    (attr) => attr.name === "content"
  )?.value;

  // Get cover path from manifest
  return Object.values(
    xml.getElementById(coverId || "")?.attributes || []
  ).find((attr) => attr.name === "href")?.value;
}

export function getElementByAttributeValue(
  xml: Document,
  tag: string,
  val: string
) {
  return Object.values(xml.getElementsByTagName(tag)).find((t) =>
    Object.values(t.attributes).find((a) => a.value === val)
  );
}
