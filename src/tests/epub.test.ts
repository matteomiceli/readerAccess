import { getRelativeOpfDir, resolveRelativePath } from "../../dist/index";

describe("getRelativeOpfDir", () => {
  test("returns undefined when opf is not nested", () => {
    expect(getRelativeOpfDir("content.opf")).toBeUndefined();
  });

  test("returns path of opf relative to epub unpacked root", () => {
    expect(getRelativeOpfDir("OEBPS/content.opf")).toBe("OEBPS/");
    expect(getRelativeOpfDir("OEBPS/META/content.opf")).toBe("OEBPS/META/");
  });
});

describe("resolveRelativeDir", () => {
  test("returns undefined if path is undefined", () => {
    expect(resolveRelativePath("test/", undefined)).toBeUndefined();
  });

  test("returns just path if the relative dir is undefined", () => {
    const path = "content.opf";
    expect(resolveRelativePath(undefined, path)).toBe(path);
  });

  test("concatinates relative path and path", () => {
    const relPath = "OEBPS/";
    const path = "content.opf";
    expect(resolveRelativePath(relPath, path)).toBe(relPath + path);
  });
});
