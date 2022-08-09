import { Platform } from "./Platform";

export interface PlatformInstaller {
  id: string;
  readonly isInstalled: Promise<boolean>;
  installOrUpdate(): Promise<void>;
  update(): Promise<void>;
  uninstall(): Promise<void>;
}

export function isPlatformInstaller(obj: any): obj is PlatformInstaller {
  return (
    typeof obj === "object" &&
    "id" in obj &&
    "isInstalled" in obj &&
    "installOrUpdate" in obj &&
    "update" in obj &&
    "uninstall" in obj &&
    typeof obj.installOrUpdate === "function" &&
    typeof obj.update === "function" &&
    typeof obj.uninstall === "function"
  );
}
