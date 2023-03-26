import {
  getRelativeOpfDir,
  pathExistsInsideOtherPath,
  resolveRelativePath,
} from "../services/epub";

describe("getRelativeOpfDir", () => {
  test("returns undefined when opf is not nested", () => {
    expect(getRelativeOpfDir("content.opf")).toBeUndefined();
  });

  test("returns path of opf relative to epub unpacked root", () => {
    expect(getRelativeOpfDir("OEBPS/content.opf")).toBe("OEBPS/");
    expect(getRelativeOpfDir("OEBPS/META/content.opf")).toBe("OEBPS/META/");
  });
});

describe("resolveRelativePath", () => {
  test("returns just path if the relative dir is undefined", () => {
    const path = "content.opf";
    expect(resolveRelativePath(path, undefined)).toBe(path);
  });

  test("concatinates relative path and path", () => {
    const relPath = "OEBPS/";
    const path = "content.opf";
    expect(resolveRelativePath(path, relPath)).toBe(relPath + path);
  });
});

describe("pathExistsInsideOtherPath", () => {
  test("returns true if inside path exists within outside", () => {
    expect(
      pathExistsInsideOtherPath("OEBPS/images/cover.jpeg", "images/cover.jpeg")
    ).toBeTruthy();
  });

  test("returns false if the inside path is longer than the outside", () => {
    expect(
      pathExistsInsideOtherPath(
        "OEBPS/images/cover.jpeg",
        "../../../images/cover.jpeg"
      )
    ).toBeFalsy();
  });
});
