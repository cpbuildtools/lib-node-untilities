export interface AfterInstall {
  afterInstall(): void | Promise<void>;
}

export function implementsAfterInstall(obj: any): obj is AfterInstall {
  return typeof obj?.afterInstall === "function";
}
