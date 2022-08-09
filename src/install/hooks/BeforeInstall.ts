export interface BeforeInstall {
  beforeInstall(): boolean | undefined | Promise<boolean | undefined>;
}

export function implementsBeforeInstall(obj: any): obj is BeforeInstall {
  return typeof obj?.beforeInstall === "function";
}
