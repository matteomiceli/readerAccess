import { getRelativeOpfDir } from "../../dist/index";

describe("getRelativeOpfDir", () => {
  test("returns undefined when opf is not nested", () => {
    expect(getRelativeOpfDir("content.opf")).toBeUndefined();
  });
  test("returns path of opf relative to epub unpacked root", () => {
    expect(getRelativeOpfDir("OEBPS/content.opf")).toBe("OEBPS/");
    expect(getRelativeOpfDir("OEBPS/META/content.opf")).toBe("OEBPS/META/");
  });
});
