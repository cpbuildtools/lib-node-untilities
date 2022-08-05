import { WorkspaceCallResult } from "./WorkspaceCallResult";

export interface WorkspaceCallError<T = unknown> extends WorkspaceCallResult {
  success: false;
  error: T;
}

export function isWorkspaceCallError<T>(obj: any): obj is WorkspaceCallError<T> {
  return typeof obj === "object" && obj.success === false && obj.hasOwnProperty("error");
}
