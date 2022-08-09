import { Platform } from "../platform/Platform";
import { PlatformInstaller } from "../platform/PlatformInstaller";

export abstract class PlatformInstallerBase implements PlatformInstaller {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly args?: string,
    public readonly dependencies: string[] = []
  ) {}
  abstract isInstalled: Promise<boolean>;
  abstract installOrUpdate(): Promise<void>;
  abstract update(): Promise<void>;
  abstract uninstall(): Promise<void>;
}
