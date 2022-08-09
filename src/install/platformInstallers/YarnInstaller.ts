import { PlatformInstallerBase } from "./PlatformInstallerBase";

export class YarnInstaller extends PlatformInstallerBase {
  public get isInstalled(): Promise<boolean> {
    return (async () => {
      return true;
    })();
  }
  public async installOrUpdate(): Promise<void> {
    console.log("YarnInstaller.installOrUpdate");
  }
  public async update(): Promise<void> {
    console.log("YarnInstaller.update");
  }
  public async uninstall(): Promise<void> {
    console.log("YarnInstaller.uninstall");
  }
}
