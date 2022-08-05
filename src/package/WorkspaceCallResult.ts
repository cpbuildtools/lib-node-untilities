import { IPackageHandler } from "./IPackageHandler";

export interface WorkspaceCallResult {
  package: IPackageHandler;
  success: boolean;
}
