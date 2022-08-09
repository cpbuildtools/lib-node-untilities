import { PlatformInstallerBase } from "./PlatformInstallerBase";

export class PnpmInstaller extends PlatformInstallerBase {
  public get isInstalled(): Promise<boolean> {
    return (async () => {
      return true;
    })();
  }
  public async installOrUpdate(): Promise<void> {
    console.log("PnpmInstaller.installOrUpdate");
  }
  public async update(): Promise<void> {
    console.log("PnpmInstaller.update");
  }
  public async uninstall(): Promise<void> {
    console.log("PnpmInstaller.uninstall");
  }
}
