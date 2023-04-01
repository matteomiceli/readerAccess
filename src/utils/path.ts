/**
 * Returns the path from the epub root to the .opf file. Useful for normalizing
 * paths parsed from the .opf to their absolute path in the epub.
 */
export function getRelativeOpfDir(opfPath: string) {
  const pathPieces = opfPath.split("/").filter((p) => !p.includes(".opf"));

  if (!pathPieces.length) return;

  return pathPieces.join("/").concat("/");
}

/**
 * Takes in an opf-parsed path and opf relative path, returning the absolute path.
 *
 * @example
 * resolveRelativePath('images/bookCover.jpeg', 'OEBPS/epub/')
 * // returns 'OEBPS/epub/images/bookCover.jpeg'
 */
export function resolveRelativePath(
  path: string,
  relativeDir: string | undefined
) {
  if (!relativeDir) return path;

  return relativeDir + path;
}

export function pathExistsInsideOtherPath(outside: string, inside: string) {
  const outsidePieces = outside.split("/");
  const insidePieces = inside.split("/");

  if (insidePieces.length > outsidePieces.length) return false;

  // remove .. and compare
  const normalizedInside = insidePieces.filter((p) => p !== "..").join("/");

  return outside.includes(normalizedInside);
}

/** Uses absolute image and cover page paths to get image source for cover page. */
export function getCoverImageSourcePath(coverPath: string, imagePath: string) {
  console.log(coverPath, imagePath);
  // OEBPS/Text/cover.xhtml
  // OEBPS/Images/9781250186485.jpg
}
