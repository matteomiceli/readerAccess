/*
 * DEMO FILE
 * run 'build' script before attempting to run demo
 */

import { Reader } from "./dist/index.js";

const selectReaderBtn = document.getElementById("select-reader");

const reader = new Reader();

selectReaderBtn.addEventListener("click", async () => {
  await reader.access();
  console.log(
    reader.files["A Memory Called Empire by Arkady Martine.epub"].kind
  );
});
