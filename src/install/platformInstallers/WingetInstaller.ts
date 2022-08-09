import { PlatformInstallerBase } from "./PlatformInstallerBase";

export class WingetInstaller extends PlatformInstallerBase {
  public get isInstalled(): Promise<boolean> {
    return (async () => {
      return true;
    })();
  }
  public async installOrUpdate(): Promise<void> {
    console.log("WingetInstaller.installOrUpdate");
  }
  public async update(): Promise<void> {
    console.log("WingetInstaller.update");
  }
  public async uninstall(): Promise<void> {
    console.log("WingetInstaller.uninstall");
  }
}
