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
  const coverTag = getElementByName(xml, "meta", "cover");
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

/** My own version of this method since it apparently doesn't exist on FF */
export function getElementByName(xml: Document, tag: string, val: string) {
  return Object.values(xml.getElementsByTagName(tag)).find((t) =>
    Object.values(t.attributes).find(
      (a) => a.name === "name" && a.value === val
    )
  );
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
