/*
 * DEMO FILE
 * run 'build' script before attempting to run demo
 */

import { Reader } from "../dist/src/index.js";

const selectReaderBtn = document.getElementById("select-reader");

let reader;

selectReaderBtn.addEventListener("click", async () => {
  reader = await new Reader().access();
  console.log(reader.books);
});
