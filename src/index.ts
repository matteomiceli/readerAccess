import { DeviceHandler } from "./services/deviceHandler.js";
export * from "./services/deviceHandler.js";

const device = new DeviceHandler();
console.log(device.device);
