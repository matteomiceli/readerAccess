# Reader Access

Reader access is a JavaScript library that exposes an e-reader-specific filesystem layer to the browser.

## Basic Usage

Import the `DeviceHandler` class from `index.js` and initialize a new reader. Use the `access()` method to prompt the user to choose their device from the directory picker.

```ts
import { DeviceHandler } from "[path_to_library]/index.js";

const reader = new DeviceHandler();

const htmlButton = document.getElementByID("get-device-button");

htmlButton.addEventListener("click", async () => {
  await reader.access();
});
```
