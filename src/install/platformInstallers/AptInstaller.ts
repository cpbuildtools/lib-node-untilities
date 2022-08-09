import { PlatformInstallerBase } from "./PlatformInstallerBase";

export class AptInstaller extends PlatformInstallerBase {
  public get isInstalled(): Promise<boolean> {
    return (async () => {
      return true;
    })();
  }
  public async installOrUpdate(): Promise<void> {
    console.log("AptInstaller.installOrUpdate");
  }
  public async update(): Promise<void> {
    console.log("AptInstaller.update");
  }
  public async uninstall(): Promise<void> {
    console.log("AptInstaller.uninstall");
  }
}
