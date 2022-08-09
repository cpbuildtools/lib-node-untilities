import { existsSync } from "fs";
import { chmod, rm, writeFile } from "fs/promises";
import path from "path";
import { exec } from "../../utils";
import { PlatformInstallerBase } from "./PlatformInstallerBase";

export abstract class BashInstaller extends PlatformInstallerBase {
  public get isInstalled(): Promise<boolean> {
    return (async () => {
      return true;
    })();
  }
  public async installOrUpdate(): Promise<void> {
    await this.execScript(this.installOrUpdateScript);
  }
  public async update(): Promise<void> {
    await this.execScript(this.updateScript);
  }
  public async uninstall(): Promise<void> {
    await this.execScript(this.uninstallScript);
  }

  protected abstract readonly uninstallScript: string;
  protected abstract readonly installOrUpdateScript: string;
  protected abstract readonly updateScript: string;

  private async execScript(script: string, cwd?: string) {
    const p = path.join(__dirname, "__exec_script.sh");
    try {
      if (existsSync(p)) {
        await rm(p, { force: true });
      }
      await writeFile(p, script, { encoding: "utf-8" });
      await exec(`chmod +x ${p}`);
      await exec(p, { cwd });
    } finally {
      if (existsSync(p)) {
        await rm(p, { force: true });
      }
    }
  }
}
