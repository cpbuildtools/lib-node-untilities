import { Class } from "type-fest";
import { PlatformInstaller } from "../platform/PlatformInstaller";
import { InstallerPlatforms } from "./InstallerPlatforms";

export interface Installer {
  id: string;
  name: string;
  categories: string[];
  platforms: Class<PlatformInstaller> | InstallerPlatforms;
}

export function isInstaller(obj: any): obj is Installer {
  return (
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    (typeof obj.platforms === "object" || typeof obj.platforms === "function")
  );
}

export function isValidInstaller(obj: any): obj is Installer {
  return isInstaller(obj) && (typeof obj.platforms === "function" || Object.keys(obj.platforms).length > 0);
}
