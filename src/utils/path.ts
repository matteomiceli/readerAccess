/** Returns the relative path to the .opf file. */
export function getRelativeOpfDir(opfPath: string) {
  const pathPieces = opfPath.split("/").filter((p) => !p.includes(".opf"));

  if (!pathPieces.length) return;

  return pathPieces.join("/").concat("/");
}

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

  console.log(outsidePieces, insidePieces);
  if (insidePieces.length > outsidePieces.length) return false;

  // remove .. and compare
  const normalizedInside = insidePieces.filter((p) => p !== "..").join("/");

  return outside.includes(normalizedInside);
}
