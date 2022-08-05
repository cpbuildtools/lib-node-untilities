import { IPackageHandlerType } from "../IPackageHandlerType";
import { NpmPackage } from "./NpmPackage";
import { PnpmPackage } from "./PNpmPackage";
import { YarnPackage } from "./YarnPackage";

export const PACKAGE_TYPES: IPackageHandlerType[] = [PnpmPackage, YarnPackage, NpmPackage];
