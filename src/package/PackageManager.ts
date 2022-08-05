import FsSync from "fs";
import Fs from "fs/promises";
import Path from "path/posix";
import { PackageJson } from "type-fest";
import { readJsonFile } from "../utils";
import { PACKAGE_TYPES } from "./impl/PACKAGE_TYPES";
import { IPackageHandler } from "./IPackageHandler";

export class PackageManager {
  public static async loadPackage(path: string) {
    const matches = ["package.json"];
    let fileName: string | undefined;

    const oPath = (path = Path.resolve(path));
    const stat = FsSync.statSync(path);
    if (stat.isFile()) {
      fileName = Path.basename(path);
      path = Path.dirname(path);
      if (!matches.includes(fileName)) {
        fileName = undefined;
      }
    }

    if (fileName === undefined) {
      const dir = await Fs.readdir(path);
      fileName = dir.find((d) => matches.includes(d) && FsSync.statSync(Path.join(path, d)).isFile());
    }
    if (fileName) {
      const fileType = Path.extname(fileName);
      let data: PackageJson | undefined = undefined;
      if (fileType === ".json") {
        data = await readJsonFile(Path.join(path, fileName));
      }

      if (data) {
        return this.createPackageInstance(data, path, fileName);
      }
    }
    throw new Error(`Could not find a package file at '${oPath}'`);
  }

  private static createPackageInstance(data: PackageJson, path: string, fileName: string): IPackageHandler {
    for (const pType of PACKAGE_TYPES) {
      if (pType.detect(data, path, fileName)) {
        return new pType(data, path, fileName);
      }
    }
    return new PACKAGE_TYPES[0](data, path, fileName);
  }
}
