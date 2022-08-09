export interface AfterUninstall {
  afterUninstall(): void | Promise<void>;
}

export function implementsAfterUninstall(obj: any): obj is AfterUninstall {
  return typeof obj?.afterUninstall === "function";
}
