// file handler goes here
export class DeviceHandler {
  device = "fart";

  async pickDir() {
    await window.showDirectoryPicker();
  }
}
