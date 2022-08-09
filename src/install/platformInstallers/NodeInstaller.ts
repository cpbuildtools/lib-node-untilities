import { PlatformInstallerBase } from "./PlatformInstallerBase";

export class NodeInstaller extends PlatformInstallerBase {
  public get isInstalled(): Promise<boolean> {
    return (async () => {
      return true;
    })();
  }
  public async installOrUpdate(): Promise<void> {
    console.log("NodeInstaller.installOrUpdate");
  }
  public async update(): Promise<void> {
    console.log("NodeInstaller.update");
  }
  public async uninstall(): Promise<void> {
    console.log("NodeInstaller.uninstall");
  }
}
