import { PackageJson } from "type-fest";
import { Package } from "./Package";

export class NpmPackage extends Package {
  public static async detect(data: PackageJson, path: string, filename: string) {
    return true;
  }

  protected execPackageManager(cmd: string): Promise<number> {
    return this.execCmd(`npm ${cmd}`);
  }
}
