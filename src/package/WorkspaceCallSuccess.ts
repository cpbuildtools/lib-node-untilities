import { WorkspaceCallResult } from "./WorkspaceCallResult";

export interface WorkspaceCallSuccess<T = any> extends WorkspaceCallResult {
  success: true;
  result: T;
}

export function isWorkspaceCallSuccess<T>(obj: any): obj is WorkspaceCallSuccess<T> {
  return typeof obj === "object" && obj.success === true && obj.hasOwnProperty("result");
}
