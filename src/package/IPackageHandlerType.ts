import { PackageJson } from "type-fest";
import { IPackageHandler } from "./IPackageHandler";

export interface IPackageHandlerType {
  detect(data: PackageJson, path: string, filename: string): boolean | Promise<boolean>;
  new (data: PackageJson, path: string, filename: string): IPackageHandler;
}
