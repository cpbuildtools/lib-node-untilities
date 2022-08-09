export interface AfterInstallOrUpdate {
  afterInstallOrUpdate(): void | Promise<void>;
}

export function implementsAfterInstallOrUpdate(obj: any): obj is AfterInstallOrUpdate {
  return typeof obj?.afterInstallOrUpdate === "function";
}
