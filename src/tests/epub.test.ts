import { getRelativeOpfDir } from "../../dist/index";

describe("getRelativeOpfDir", () => {
  test("returns undefined when opf is not nested", () => {
    const opfPath = "content.opf";
    expect(getRelativeOpfDir(opfPath)).toBeUndefined();
  });
});
