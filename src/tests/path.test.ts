import {
  getRelativeOpfDir,
  resolveRelativePath,
  pathExistsInsideOtherPath,
} from "../utils/path";

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
  test.each([
    { outside: "OEBPS/images/cover.jpeg", inside: "images/cover.jpeg" },
    { outside: "OEBPS/images/cover.jpeg", inside: "../images/cover.jpeg" },
    { outside: "OEBPS/images/cover.jpeg", inside: "cover.jpeg" },
  ])(
    "returns true if inside path exists within outside",
    ({ outside, inside }) => {
      expect(pathExistsInsideOtherPath(outside, inside)).toBeTruthy();
    }
  );

  test.each([
    {
      outside: "OEBPS/images/cover.jpeg",
      inside: "../../../images/cover.jpeg",
    },
    { outside: "OEBPS/images/cover.jpeg", inside: "../../images/cover.jpeg" },
    { outside: "OEBPS/images/cover.jpeg", inside: "../../photos/cover.jpeg" },
    { outside: "OEBPS/images/cover.jpeg", inside: "/cover.png" },
  ])(
    "returns false if the outside path does not contain the inside path",
    ({ outside, inside }) => {
      expect(pathExistsInsideOtherPath(outside, inside)).toBeFalsy();
    }
  );
});
