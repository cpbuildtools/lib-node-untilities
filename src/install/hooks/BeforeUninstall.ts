export interface BeforeUninstall {
  beforeUninstall(): boolean | undefined | Promise<boolean | undefined>;
}

export function implementsBeforeUninstall(obj: any): obj is BeforeUninstall {
  return typeof obj?.beforeUninstall === "function";
}
