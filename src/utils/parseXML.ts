export function getContentByTag(xml: Document, tagName: string) {
  return xml.getElementsByTagName(tagName)?.[0]?.innerHTML;
}

export function getAttributeValueByName(
  xml: Document,
  tagName: string,
  attributeName: string
) {
  return Object.values(
    xml.getElementsByTagName(tagName)?.[0]?.attributes || {}
  )?.find((attr) => attr.name === attributeName)?.value;
}

export function getCoverImagePath(xml: Document) {
  const coverTag = getElementByName(xml, "meta", "cover");
  if (!coverTag) {
    return;
  }

  // Manifest Id
  const coverId = Object.values(coverTag.attributes).find(
    (attr) => attr.name === "content"
  )?.value;

  // Get cover path from manifest
  return getManifestItemPathById(xml, coverId || "");
}

function getManifestItemPathById(xml: Document, id: string) {
  return Object.values(xml.getElementById(id)?.attributes || []).find(
    (attr) => attr.name === "href"
  )?.value;
}

/** Returns the path to the first entry in spine if exists. */
export function getFirstSpineEntryPath(xml: Document) {
  const firstInSpine = xml.getElementsByTagName("itemref")[0];

  // manifest Id
  const firstId = Object.values(firstInSpine.attributes).find(
    (a) => a.name === "idref"
  )?.value;

  return getManifestItemPathById(xml, firstId || "");
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
  return Object.values(xml.getElementsByTagName(tag) || {}).find((t) =>
    Object.values(t.attributes).find((a) => a.value === val)
  );
}
